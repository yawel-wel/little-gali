import { NextRequest, NextResponse } from "next/server";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { savePreviewSession, toPublicView } from "@/lib/preview-session/store";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requirePreviewSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json()) as {
    slotIndex?: number;
    candidateId?: string;
  };
  const { slotIndex, candidateId } = body;

  if (
    typeof slotIndex !== "number" ||
    slotIndex < 0 ||
    slotIndex > 4 ||
    !candidateId
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const session = auth.session;
  if (session.phase !== "bw_review") {
    return NextResponse.json({ error: "Session is not in B&W review" }, { status: 409 });
  }

  const slot = session.slots[slotIndex];
  const candidate = slot?.candidates.find((item) => item.id === candidateId);
  if (!slot || !candidate || candidate.error || !candidate.previewUrl) {
    return NextResponse.json({ error: "Candidate not available" }, { status: 400 });
  }

  slot.activeCandidateId = candidateId;
  await savePreviewSession(session);
  return NextResponse.json({ session: toPublicView(session) });
}
