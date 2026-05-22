import type { PreviewCandidate, PreviewSession } from "./types";

export type PreviewBookSide = "bw" | "color";

export type FoundPreviewCandidate = {
  slotIndex: number;
  candidate: PreviewCandidate;
};

export function findCandidateInSession(
  session: PreviewSession,
  candidateId: string,
  bookSide: PreviewBookSide,
): FoundPreviewCandidate | null {
  for (let slotIndex = 0; slotIndex < session.slots.length; slotIndex += 1) {
    const slot = session.slots[slotIndex];
    if (!slot) {
      continue;
    }

    if (bookSide === "bw") {
      const candidate = slot.candidates.find((item) => item.id === candidateId);
      if (candidate) {
        return { slotIndex, candidate };
      }
      continue;
    }

    if (slot.colorPreview?.id === candidateId) {
      return { slotIndex, candidate: slot.colorPreview };
    }

    const colorCandidate = (slot.colorCandidates ?? []).find(
      (item) => item.id === candidateId,
    );
    if (colorCandidate) {
      return { slotIndex, candidate: colorCandidate };
    }
  }

  return null;
}

export function assetPathFromPublicId(publicId: string): string {
  return publicId.replace(/\.(jpg|jpeg|png)$/i, "");
}
