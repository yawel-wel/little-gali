import { NextResponse } from "next/server";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { savePreviewSession, toPublicView } from "@/lib/preview-session/store";

export const runtime = "nodejs";

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
  await savePreviewSession(session);
  return NextResponse.json({ session: toPublicView(session) });
}
