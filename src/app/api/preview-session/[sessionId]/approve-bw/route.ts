import { after, NextResponse } from "next/server";
import { requirePreviewSession } from "@/lib/preview-session/auth";
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
      await markSessionPipelineFailed(sessionId, error);
    }
  });

  return NextResponse.json({ session: toPublicView(session) });
}
