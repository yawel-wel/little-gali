import type { StyleType } from "@/components/style-selector";
import { getColorCandidateForStyle } from "./color-by-style";
import { effectiveChangeCreditsRemaining } from "./credits";
import { parseBookFlow } from "./book-flow";
import { normalizeDisplayOrder, urlsInDisplayOrder } from "./display-order";
import { isPreviewLimitsBypassed } from "./preview-limits-bypass";
import type {
  PreviewGenerationStatus,
  PreviewSession,
  PreviewSessionPublicView,
  PreviewSlot,
} from "./types";
import { kvGet, kvSet } from "./kv";
import { PREVIEW_SESSION_TTL_SECONDS, previewSessionKey } from "./redis";

export function createEmptySlots(originalUrls: string[]): PreviewSlot[] {
  return originalUrls.map((originalUrl) => ({
    originalUrl,
    candidates: [],
    inFlight: false,
  }));
}

export function createStartingSlots(originalUrls: string[]): PreviewSlot[] {
  return originalUrls.map((originalUrl) => ({
    originalUrl,
    candidates: [],
    inFlight: true,
  }));
}

export function createPendingSlots(count = 5): PreviewSlot[] {
  return Array.from({ length: count }, () => ({
    originalUrl: "",
    candidates: [],
    inFlight: true,
  }));
}

export async function savePreviewSession(session: PreviewSession): Promise<void> {
  session.updatedAt = new Date().toISOString();
  await kvSet(previewSessionKey(session.id), session, {
    ex: PREVIEW_SESSION_TTL_SECONDS,
  });
}

function ensureColorCandidatesPersisted(slot: PreviewSlot): void {
  if (slot.colorPreview?.kind !== "color") {
    return;
  }
  const existing = slot.colorCandidates ?? [];
  if (!existing.some((candidate) => candidate.id === slot.colorPreview?.id)) {
    slot.colorCandidates = [...existing, slot.colorPreview];
  }
}

export async function loadPreviewSession(
  sessionId: string,
): Promise<PreviewSession | null> {
  const data = await kvGet<PreviewSession>(previewSessionKey(sessionId));
  if (!data) {
    return null;
  }
  for (const slot of data.slots) {
    ensureColorCandidatesPersisted(slot);
  }
  return data;
}

function getColorCandidates(slot: PreviewSlot): PreviewSlot["colorCandidates"] {
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

function slotHasBwResult(slot: PreviewSlot): boolean {
  const active = slot.candidates.find(
    (candidate) =>
      candidate.kind === "bw" && candidate.id === slot.activeCandidateId,
  );
  return Boolean(active?.previewUrl || active?.error);
}

export function resolveGenerationStatus(
  session: PreviewSession,
): PreviewGenerationStatus {
  if (session.generationStatus) {
    return session.generationStatus;
  }
  const allBwDone = session.slots.every(slotHasBwResult);
  if (allBwDone) {
    return "complete";
  }
  if (
    session.slots.some((slot) => slot.inFlight || slot.colorInFlight)
  ) {
    return "running";
  }
  return "not_started";
}

export function toPublicView(session: PreviewSession): PreviewSessionPublicView {
  const bookFlow = parseBookFlow(session.bookFlow);
  const isColorful = bookFlow === "colorful";
  const inBwReview = !isColorful && session.phase === "bw_review";
  const inColorPhase =
    isColorful ||
    session.phase === "bw_approved" ||
    session.phase === "style_selected";
  const generationStatus = resolveGenerationStatus(session);
  const allSlotsReady = session.slots.every((slot) => {
    if (isColorful) {
      return Boolean(
        slot.colorPreview?.previewUrl || slot.colorPreview?.error,
      );
    }
    const active = slot.candidates.find(
      (candidate) =>
        candidate.kind === "bw" && candidate.id === slot.activeCandidateId,
    );
    return Boolean(active?.previewUrl || active?.error);
  });
  const noBwInFlight = session.slots.every((slot) => !slot.inFlight);
  const noColorInFlight = session.slots.every((slot) => !slot.colorInFlight);
  const hasCredits =
    isPreviewLimitsBypassed() ||
    effectiveChangeCreditsRemaining(session) > 0;

  return {
    id: session.id,
    updatedAt: session.updatedAt,
    phase: session.phase,
    generationStatus,
    bookFlow,
    displayOrder: normalizeDisplayOrder(session.displayOrder, bookFlow),
    changeCreditsRemaining: effectiveChangeCreditsRemaining(session),
    slots: session.slots.map((slot, index) => ({
      index,
      originalUrl: slot.originalUrl,
      activeCandidateId: slot.activeCandidateId,
      inFlight: slot.inFlight,
      candidates: slot.candidates.filter((candidate) => candidate.kind === "bw"),
      colorCandidates: getColorCandidates(slot),
      colorPreview: slot.colorPreview,
      colorInFlight: Boolean(slot.colorInFlight),
    })),
    selectedColorStyle: session.selectedColorStyle,
    pendingColorRegenSlotIndexes: session.pendingColorRegenSlotIndexes ?? [],
    frozenStyleStripThumbnails: session.frozenStyleStripThumbnails,
    initializationError: session.initializationError,
    canRegenerate:
      !isColorful &&
      (inBwReview || inColorPhase) &&
      noBwInFlight &&
      hasCredits,
    canReplace: inBwReview && noBwInFlight && hasCredits,
    canApproveBw:
      inBwReview &&
      noBwInFlight &&
      allSlotsReady &&
      session.slots.every((slot) => {
        const active = slot.candidates.find(
          (candidate) =>
            candidate.kind === "bw" && candidate.id === slot.activeCandidateId,
        );
        return Boolean(active?.previewUrl && !active.error);
      }),
    canRegenerateColor: inColorPhase && noColorInFlight && hasCredits,
    canSelectStyle:
      !isColorful && inColorPhase && generationStatus === "complete",
    canAddToCart:
      inColorPhase &&
      generationStatus === "complete" &&
      noColorInFlight &&
      session.phase !== "cart_added",
  };
}

export function getSelectedOriginalUrls(session: PreviewSession): string[] {
  return urlsInDisplayOrder(session, (slot) => slot.originalUrl);
}

export function getSelectedGeneratedBwUrls(session: PreviewSession): string[] {
  return urlsInDisplayOrder(session, (slot) => {
    const active = slot.candidates.find(
      (candidate) =>
        candidate.kind === "bw" && candidate.id === slot.activeCandidateId,
    );
    if (!active?.cleanUrl) {
      throw new Error(`Missing selected B&W output for slot`);
    }
    return active.cleanUrl;
  });
}

export function getSelectedGeneratedColorUrls(
  session: PreviewSession,
  style: StyleType,
): string[] {
  return urlsInDisplayOrder(session, (slot) => {
    const active = getColorCandidateForStyle(slot, style);
    if (!active?.cleanUrl) {
      throw new Error(`Missing selected color output for slot`);
    }
    return active.cleanUrl;
  });
}
