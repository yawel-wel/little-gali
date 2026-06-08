import { NextRequest, NextResponse } from "next/server";
import { requireFramedArtSession } from "@/lib/framed-art/auth";
import { runFramedArtStyleGeneration } from "@/lib/framed-art/generation-runner";
import { getFramedArtGenerationErrorMessage } from "@/lib/framed-art/generation-error-message";
import { isFramedArtProhibitedContent } from "@/lib/framed-art/prohibited-content";
import {
  hasFramedArtPreviewReady,
  recoverStaleFramedArtInFlight,
  toPublicView,
} from "@/lib/framed-art/store";
import {
  consumeFramedUploadSlot,
  peekFramedUploadLimit,
} from "@/lib/framed-art/upload-limits";
import { trackServerError } from "@/lib/analytics-server";
import { getRequestIp, hashClientIp } from "@/lib/preview-session/hash";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const ipHash = hashClientIp(getRequestIp(request));

  try {
    const auth = await requireFramedArtSession(sessionId);
    if (auth instanceof NextResponse) return auth;

    let session = await recoverStaleFramedArtInFlight(auth.session);

    if (hasFramedArtPreviewReady(session)) {
      const peek = await peekFramedUploadLimit(ipHash);
      return NextResponse.json({
        session: toPublicView(session),
        uploadsRemaining: peek.remaining,
      });
    }

    if (session.inFlight) {
      const peek = await peekFramedUploadLimit(ipHash);
      return NextResponse.json({
        session: toPublicView(session),
        uploadsRemaining: peek.remaining,
      });
    }

    const updated = await runFramedArtStyleGeneration(sessionId);
    if (!updated) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    let uploadsRemaining: number;
    if (updated.generationStatus === "complete") {
      const slot = await consumeFramedUploadSlot(ipHash);
      uploadsRemaining = slot.remaining;
    } else {
      const peek = await peekFramedUploadLimit(ipHash);
      uploadsRemaining = peek.remaining;
    }

    if (updated.generationStatus === "failed") {
      if (isFramedArtProhibitedContent(updated)) {
        return NextResponse.json({
          session: toPublicView(updated),
          uploadsRemaining,
        });
      }
      const detail =
        getFramedArtGenerationErrorMessage(updated) ?? "Generation failed";
      console.error("Framed art generation failed:", sessionId, detail);
      trackServerError({
        step: "frame_generation",
        error_message: detail,
      });
      return NextResponse.json(
        { error: detail, session: toPublicView(updated), uploadsRemaining },
        { status: 500 },
      );
    }

    return NextResponse.json({
      session: toPublicView(updated),
      uploadsRemaining,
    });
  } catch (error: unknown) {
    console.error("Framed art generate route error:", sessionId, error);
    trackServerError({
      step: "frame_generation",
      error_message: error instanceof Error ? error.message : "Internal server error",
    });
    const peek = await peekFramedUploadLimit(ipHash);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
        uploadsRemaining: peek.remaining,
      },
      { status: 500 },
    );
  }
}
