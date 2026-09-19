import { after, NextResponse } from "next/server";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { parseBookFlow } from "@/lib/preview-session/book-flow";
import {
  runClassicBwPipelineForSession,
  startClassicBwGeneration,
} from "@/lib/preview-session/preview-pipeline";
import { toPublicView } from "@/lib/preview-session/store";
import { assertGenerationRateLimit } from "@/lib/rate-limit/generation-limiter";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const generationLimit = await assertGenerationRateLimit(sessionId);
  if (generationLimit) {
    return generationLimit;
  }

  const auth = await requirePreviewSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  const session = auth.session;
  if (parseBookFlow(session.bookFlow) !== "classic") {
    return NextResponse.json(
      { error: "B&W generation is only available for the classic book" },
      { status: 409 },
    );
  }
  if (session.phase === "cart_added") {
    return NextResponse.json(
      { error: "B&W preview is not available after cart submission" },
      { status: 409 },
    );
  }
  if (session.phase === "bw_review") {
    return NextResponse.json(
      { error: "Color preview must be ready before generating B&W" },
      { status: 409 },
    );
  }

  const view = toPublicView(session);
  if (!view.canStartBw && !session.slots.some((slot) => slot.inFlight)) {
    return NextResponse.json({ session: view });
  }

  const started = await startClassicBwGeneration(session);
  if (started.scheduled) {
    after(async () => {
      await runClassicBwPipelineForSession(sessionId);
    });
  }

  return NextResponse.json({ session: toPublicView(started.session) });
}
