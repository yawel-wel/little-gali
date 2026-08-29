import type { StyleType } from "@/components/style-selector";
import { isPreviewSingleColorStyleEnabled } from "@/lib/feature-flags";
import type { PreviewCandidate, PreviewSession, PreviewSlot } from "./types";

export const COLOR_STYLES: StyleType[] = ["pencil", "cartoon", "watercolor"];

/** Dual-mode color styles (kept for rollback when single-style flag is off). */
export const PREVIEW_COLOR_STYLES: StyleType[] = ["pencil", "watercolor"];

/** Dual-mode default; prefer getDefaultColorStyle() at runtime. */
export const DEFAULT_COLOR_STYLE: StyleType = "watercolor";

export const SINGLE_PREVIEW_COLOR_STYLE: StyleType = "pens";

/** Active preview color styles based on NEXT_PUBLIC_PREVIEW_SINGLE_COLOR_STYLE. */
export function getPreviewColorStyles(): StyleType[] {
  return isPreviewSingleColorStyleEnabled()
    ? [SINGLE_PREVIEW_COLOR_STYLE]
    : PREVIEW_COLOR_STYLES;
}

/** Default color style for the active preview mode. */
export function getDefaultColorStyle(): StyleType {
  return isPreviewSingleColorStyleEnabled()
    ? SINGLE_PREVIEW_COLOR_STYLE
    : DEFAULT_COLOR_STYLE;
}

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

function pickDisplayColorCandidateForStyle(
  slot: PreviewSlotPublic,
  style: StyleType,
  forStyle: PreviewCandidate[],
): PreviewCandidate | undefined {
  if (
    slot.colorPreview &&
    (slot.colorPreview.style ?? "pencil") === style &&
    forStyle.some((candidate) => candidate.id === slot.colorPreview?.id)
  ) {
    return slot.colorPreview;
  }
  return pickLatestDisplayColorCandidate(forStyle);
}

export function getColorCandidateForStyle(
  slot: PreviewSlot,
  style: StyleType,
): PreviewCandidate | undefined {
  return pickDisplayColorCandidateForStyle(
    slot,
    style,
    getColorCandidatesForStyle(slot, style),
  );
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
  return pickDisplayColorCandidateForStyle(slot, style, forStyle);
}
