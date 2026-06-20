import type { StyleType } from "@/components/style-selector";
import { getColorCandidateForStyle } from "./color-by-style";
import { effectiveChangeCreditsRemaining } from "./credits";
import { normalizeDisplayOrder } from "./display-order";
import { resolveGenerationStatus } from "./store";
import type { PreviewPhase, PreviewSession } from "./types";

export type PreviewResumeStatus =
  | "generating"
  | "review_bw"
  | "pick_style"
  | "ready_to_order"
  | "in_cart";

export interface PreviewSessionResumeSummary {
  id: string;
  createdAt: string;
  updatedAt: string;
  phase: PreviewPhase;
  selectedColorStyle?: StyleType;
  /** Up to two preview URLs for the card UI. */
  thumbnailUrls: string[];
  /** Total generated thumbnails available for this session. */
  thumbnailCount: number;
  status: PreviewResumeStatus;
  changeCreditsRemaining: number;
}

export const PREVIEW_RESUME_LIST_MAX_IDS = 10;
export const PREVIEW_RESUME_DISPLAY_LIMIT = 3;
export const PREVIEW_RESUME_THUMBNAIL_PREVIEW_COUNT = 2;

function getSlotThumbnailUrl(
  session: PreviewSession,
  slotIndex: number,
): string | undefined {
  const slot = session.slots[slotIndex];
  if (!slot) {
    return undefined;
  }

  const inColorPhase =
    session.phase === "bw_approved" ||
    session.phase === "style_selected" ||
    session.phase === "cart_added";

  if (inColorPhase) {
    const style = session.selectedColorStyle ?? "pencil";
    const colorCandidate = getColorCandidateForStyle(slot, style);
    if (colorCandidate?.previewUrl) {
      return colorCandidate.previewUrl;
    }
    if (slot.colorPreview?.previewUrl) {
      return slot.colorPreview.previewUrl;
    }
  }

  const activeBw = slot.candidates.find(
    (candidate) =>
      candidate.kind === "bw" && candidate.id === slot.activeCandidateId,
  );
  if (activeBw?.previewUrl) {
    return activeBw.previewUrl;
  }

  const firstBwPreview = slot.candidates.find(
    (candidate) => candidate.kind === "bw" && candidate.previewUrl,
  );
  if (firstBwPreview?.previewUrl) {
    return firstBwPreview.previewUrl;
  }

  if (slot.originalUrl?.trim()) {
    return slot.originalUrl;
  }

  return undefined;
}

export function getPreviewSessionThumbnailUrls(session: PreviewSession): string[] {
  const order = normalizeDisplayOrder(session.displayOrder);
  const urls: string[] = [];

  for (const slotIndex of order) {
    const url = getSlotThumbnailUrl(session, slotIndex);
    if (url) {
      urls.push(url);
    }
  }

  return urls.slice(0, 5);
}

export function isPreviewSessionResumable(session: PreviewSession): boolean {
  return session.slots.some(
    (slot) =>
      Boolean(slot.originalUrl?.trim()) ||
      slot.candidates.some((candidate) => Boolean(candidate.previewUrl)) ||
      Boolean(slot.colorPreview?.previewUrl),
  );
}

export function resolvePreviewResumeStatus(
  session: PreviewSession,
): PreviewResumeStatus {
  if (session.phase === "cart_added") {
    return "in_cart";
  }

  const generationStatus = resolveGenerationStatus(session);
  if (session.phase === "bw_review") {
    if (generationStatus === "running" || generationStatus === "not_started") {
      return "generating";
    }
    return "review_bw";
  }

  if (session.phase === "bw_approved") {
    return "pick_style";
  }

  if (session.phase === "style_selected") {
    return "ready_to_order";
  }

  return "review_bw";
}

export function toPreviewSessionResumeSummary(
  session: PreviewSession,
): PreviewSessionResumeSummary | null {
  if (!isPreviewSessionResumable(session)) {
    return null;
  }

  const allThumbnailUrls = getPreviewSessionThumbnailUrls(session);
  if (allThumbnailUrls.length === 0) {
    return null;
  }

  return {
    id: session.id,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    phase: session.phase,
    selectedColorStyle: session.selectedColorStyle,
    thumbnailUrls: allThumbnailUrls.slice(0, PREVIEW_RESUME_THUMBNAIL_PREVIEW_COUNT),
    thumbnailCount: allThumbnailUrls.length,
    status: resolvePreviewResumeStatus(session),
    changeCreditsRemaining: effectiveChangeCreditsRemaining(session),
  };
}
