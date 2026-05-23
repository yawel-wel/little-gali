import type { StyleType } from "@/components/style-selector";
import { getColorCandidateForStyleFromPublicSlot } from "./color-by-style";
import type { PreviewSessionPublicView } from "./types";

export type PublicPreviewSlot = PreviewSessionPublicView["slots"][number];

function sortVersionCandidatesWithActiveFirst(
  candidates: PublicPreviewSlot["candidates"],
  activeCandidateId: string | undefined,
) {
  return [...candidates].sort((a, b) => {
    if (a.id === activeCandidateId) {
      return -1;
    }
    if (b.id === activeCandidateId) {
      return 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/** B&W outputs from the current upload only — includes the active version. */
export function getSelectableBwVersionCandidates(slot: PublicPreviewSlot) {
  const versions = slot.candidates.filter(
    (candidate) =>
      Boolean(candidate.previewUrl) &&
      !candidate.error &&
      candidate.sourceUrl === slot.originalUrl,
  );

  return sortVersionCandidatesWithActiveFirst(
    versions,
    slot.activeCandidateId,
  );
}

/** Color outputs for the active style from the current upload only — includes active. */
export function getSelectableColorVersionCandidates(
  slot: PublicPreviewSlot,
  style: StyleType,
) {
  const activeColor = getColorCandidateForStyleFromPublicSlot(slot, style);

  const versions = (slot.colorCandidates ?? []).filter(
    (candidate) =>
      candidate.kind === "color" &&
      (candidate.style ?? "pencil") === style &&
      Boolean(candidate.previewUrl) &&
      !candidate.error &&
      candidate.sourceUrl === slot.originalUrl,
  );

  return sortVersionCandidatesWithActiveFirst(versions, activeColor?.id);
}
