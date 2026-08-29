import { after, NextResponse } from "next/server";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import {
  approveBwClaimKey,
  PIPELINE_CLAIM_TTL_SECONDS,
  tryClaimGeneration,
} from "@/lib/preview-session/generation-claim";
import { logPreviewPipelineBackgroundFailed } from "@/lib/preview-session/generation-log";
import {
  markSessionPipelineFailed,
  runColorPipelineForApprovedSession,
} from "@/lib/preview-session/preview-pipeline";
import { savePreviewSession, toPublicView } from "@/lib/preview-session/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requirePreviewSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  const session = auth.session;
  const view = toPublicView(session);
  if (!view.canApproveBw) {
    return NextResponse.json({ error: "B&W preview is not ready to approve" }, { status: 409 });
  }

  // Only one approve → color pipeline may run per session.
  const claimed = await tryClaimGeneration(
    approveBwClaimKey(sessionId),
    PIPELINE_CLAIM_TTL_SECONDS,
  );
  if (!claimed) {
    return NextResponse.json({ session: toPublicView(session) });
  }

  // Already past BW review (e.g. concurrent approve) — do not schedule again.
  if (session.phase !== "bw_review") {
    return NextResponse.json({ session: toPublicView(session) });
  }

  session.phase = "bw_approved";
  session.generationStatus = "running";
  session.slots = session.slots.map((slot) => ({
    ...slot,
    colorInFlight: true,
  }));
  await savePreviewSession(session);

  after(async () => {
    try {
      await runColorPipelineForApprovedSession(sessionId);
    } catch (error) {
      console.error("Background color pipeline failed:", sessionId, error);
      logPreviewPipelineBackgroundFailed(sessionId, "color", error);
      await markSessionPipelineFailed(sessionId, error);
    }
  });

  return NextResponse.json({ session: toPublicView(session) });
}
