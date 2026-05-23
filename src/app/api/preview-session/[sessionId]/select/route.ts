import { NextRequest, NextResponse } from "next/server";
import type { StyleType } from "@/components/style-selector";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { getColorCandidateForStyle } from "@/lib/preview-session/color-by-style";
import {
  clearSlotColorPreview,
  enqueuePendingColorRegen,
} from "@/lib/preview-session/color-generation-runner";
import { logPreviewCandidateReselected } from "@/lib/preview-session/generation-log";
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
  const bwCandidate = slot?.candidates.find((item) => item.id === candidateId);
  const colorCandidates = slot?.colorCandidates ?? [];
  const colorCandidate =
    colorCandidates.find((item) => item.id === candidateId) ??
    (slot?.colorPreview?.id === candidateId ? slot.colorPreview : undefined);
  const candidate = bwCandidate ?? colorCandidate;

  if (!slot || !candidate || candidate.error || !candidate.previewUrl) {
    return NextResponse.json({ error: "Candidate not available" }, { status: 400 });
  }

  if (
    bwCandidate &&
    bwCandidate.sourceUrl !== slot.originalUrl
  ) {
    return NextResponse.json(
      { error: "Candidate is from a previous photo" },
      { status: 409 },
    );
  }

  if (candidate.kind === "color") {
    const style = (candidate.style ?? "pencil") as StyleType;
    const previousColorId = getColorCandidateForStyle(slot, style)?.id;
    if (previousColorId && previousColorId !== candidateId) {
      logPreviewCandidateReselected({
        sessionId,
        slot: slotIndex,
        side: "color",
        previousCandidateId: previousColorId,
        candidateId,
        style,
      });
    }
    slot.colorCandidates = colorCandidates.some((item) => item.id === candidate.id)
      ? colorCandidates
      : [...colorCandidates, candidate];
    slot.colorPreview = candidate;
  } else {
    const previousActiveId = slot.activeCandidateId;
    if (previousActiveId && previousActiveId !== candidateId) {
      logPreviewCandidateReselected({
        sessionId,
        slot: slotIndex,
        side: "bw",
        previousCandidateId: previousActiveId,
        candidateId,
      });
      clearSlotColorPreview(session, slotIndex);
      enqueuePendingColorRegen(session, slotIndex);
    }
    slot.activeCandidateId = candidateId;
  }

  await savePreviewSession(session);
  return NextResponse.json({ session: toPublicView(session) });
}
