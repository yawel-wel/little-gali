import { normalizeDisplayOrder, urlsInDisplayOrder } from "./display-order";
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

export function createPendingSlots(): PreviewSlot[] {
  return Array.from({ length: 5 }, () => ({
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
  const inBwReview = session.phase === "bw_review";
  const inColorPhase =
    session.phase === "bw_approved" || session.phase === "style_selected";
  const generationStatus = resolveGenerationStatus(session);
  const allSlotsReady = session.slots.every((slot) => {
    const active = slot.candidates.find(
      (candidate) =>
        candidate.kind === "bw" && candidate.id === slot.activeCandidateId,
    );
    return Boolean(active?.previewUrl || active?.error);
  });
  const noBwInFlight = session.slots.every((slot) => !slot.inFlight);
  const noColorInFlight = session.slots.every((slot) => !slot.colorInFlight);
  const hasCredits = session.changeCreditsRemaining > 0;

  return {
    id: session.id,
    updatedAt: session.updatedAt,
    phase: session.phase,
    generationStatus,
    displayOrder: normalizeDisplayOrder(session.displayOrder),
    changeCreditsRemaining: session.changeCreditsRemaining,
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
    canRegenerate: (inBwReview || inColorPhase) && noBwInFlight && hasCredits,
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
    canSelectStyle: inColorPhase && generationStatus === "complete",
    canAddToCart: session.phase === "style_selected",
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
