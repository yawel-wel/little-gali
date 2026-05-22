import type { StyleType } from "@/components/style-selector";
import type { PreviewCandidate, PreviewSession, PreviewSlot } from "./types";

export const COLOR_STYLES: StyleType[] = ["pencil", "cartoon", "watercolor"];

export const BOOK_SLOT_INDEX = 0;

function listColorCandidates(slot: PreviewSlot): PreviewCandidate[] {
  const colorCandidates =
    slot.colorCandidates?.filter((candidate) => candidate.kind === "color") ??
    [];
  if (
    slot.colorPreview &&
    !colorCandidates.some((candidate) => candidate.id === slot.colorPreview?.id)
  ) {
    return [...colorCandidates, slot.colorPreview];
  }
  return colorCandidates;
}

export function getColorCandidatesForStyle(
  slot: PreviewSlot,
  style: StyleType,
): PreviewCandidate[] {
  return listColorCandidates(slot).filter(
    (candidate) => (candidate.style ?? "pencil") === style,
  );
}

function pickLatestDisplayColorCandidate(
  forStyle: PreviewCandidate[],
): PreviewCandidate | undefined {
  if (forStyle.length === 0) {
    return undefined;
  }
  const withPreview = forStyle.filter((candidate) => candidate.previewUrl);
  const pool = withPreview.length > 0 ? withPreview : forStyle;
  return pool.reduce((latest, candidate) =>
    new Date(candidate.createdAt).getTime() >=
    new Date(latest.createdAt).getTime()
      ? candidate
      : latest,
  );
}

export function getColorCandidateForStyle(
  slot: PreviewSlot,
  style: StyleType,
): PreviewCandidate | undefined {
  return pickLatestDisplayColorCandidate(getColorCandidatesForStyle(slot, style));
}

export function slotHasColorForStyle(slot: PreviewSlot, style: StyleType): boolean {
  const candidate = getColorCandidateForStyle(slot, style);
  return Boolean(candidate?.previewUrl || candidate?.error);
}

export function slotHasColorPreviewForStyle(
  slot: PreviewSlot,
  style: StyleType,
): boolean {
  return Boolean(getColorCandidateForStyle(slot, style)?.previewUrl);
}

export function allSlotsHaveColorForStyle(
  session: PreviewSession,
  style: StyleType,
): boolean {
  return session.slots.every((slot) => slotHasColorForStyle(slot, style));
}

export function syncColorPreviewToStyle(
  session: PreviewSession,
  style: StyleType,
): void {
  session.selectedColorStyle = style;
  syncColorPreviewForSlots(
    session,
    style,
    session.slots.map((_, slotIndex) => slotIndex),
  );
}

export function syncColorPreviewForSlots(
  session: PreviewSession,
  style: StyleType,
  slotIndexes: number[],
): void {
  for (const slotIndex of slotIndexes) {
    const slot = session.slots[slotIndex];
    if (!slot) {
      continue;
    }
    const candidate = getColorCandidateForStyle(slot, style);
    if (candidate) {
      slot.colorPreview = candidate;
    }
  }
}

export type PreviewSlotPublic = PreviewSession["slots"][number] | {
  index: number;
  colorCandidates?: PreviewCandidate[];
  colorPreview?: PreviewCandidate;
};

export function getColorCandidateForStyleFromPublicSlot(
  slot: PreviewSlotPublic,
  style: StyleType,
): PreviewCandidate | undefined {
  const colorCandidates =
    slot.colorCandidates?.filter((candidate) => candidate.kind === "color") ??
    [];
  const merged =
    slot.colorPreview &&
    !colorCandidates.some((candidate) => candidate.id === slot.colorPreview?.id)
      ? [...colorCandidates, slot.colorPreview]
      : colorCandidates;
  const forStyle = merged.filter(
    (candidate) => (candidate.style ?? "pencil") === style,
  );
  return pickLatestDisplayColorCandidate(forStyle);
}
