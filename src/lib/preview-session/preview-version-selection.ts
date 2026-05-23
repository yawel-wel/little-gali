import type { StyleType } from "@/components/style-selector";
import type { PreviewSessionPublicView } from "./types";

export type PublicPreviewSlot = PreviewSessionPublicView["slots"][number];

function sortVersionCandidatesChronologically(
  candidates: PublicPreviewSlot["candidates"],
) {
  return [...candidates].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

/** B&W outputs from the current upload only — includes the active version. */
export function getSelectableBwVersionCandidates(slot: PublicPreviewSlot) {
  const versions = slot.candidates.filter(
    (candidate) =>
      Boolean(candidate.previewUrl) &&
      !candidate.error &&
      candidate.sourceUrl === slot.originalUrl,
  );

  return sortVersionCandidatesChronologically(versions);
}

/** Color outputs for the active style from the current upload only — includes active. */
export function getSelectableColorVersionCandidates(
  slot: PublicPreviewSlot,
  style: StyleType,
) {
  const versions = (slot.colorCandidates ?? []).filter(
    (candidate) =>
      candidate.kind === "color" &&
      (candidate.style ?? "pencil") === style &&
      Boolean(candidate.previewUrl) &&
      !candidate.error &&
      candidate.sourceUrl === slot.originalUrl,
  );

  return sortVersionCandidatesChronologically(versions);
}
