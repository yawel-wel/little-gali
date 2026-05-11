import type {
  PreviewSession,
  PreviewSessionPublicView,
  PreviewSlot,
} from "./types";
import {
  PREVIEW_SESSION_TTL_SECONDS,
  getRedis,
  previewSessionKey,
} from "./redis";

export function createEmptySlots(originalUrls: string[]): PreviewSlot[] {
  return originalUrls.map((originalUrl) => ({
    originalUrl,
    candidates: [],
    inFlight: false,
  }));
}

export async function savePreviewSession(session: PreviewSession): Promise<void> {
  const redis = getRedis();
  session.updatedAt = new Date().toISOString();
  await redis.set(previewSessionKey(session.id), session, {
    ex: PREVIEW_SESSION_TTL_SECONDS,
  });
}

export async function loadPreviewSession(
  sessionId: string,
): Promise<PreviewSession | null> {
  const redis = getRedis();
  const data = await redis.get<PreviewSession>(previewSessionKey(sessionId));
  return data ?? null;
}

export function toPublicView(session: PreviewSession): PreviewSessionPublicView {
  const inBwReview = session.phase === "bw_review";
  const hasCredits = session.changeCreditsRemaining > 0;
  const allSlotsReady = session.slots.every((slot) => {
    const active = slot.candidates.find((c) => c.id === slot.activeCandidateId);
    return Boolean(active?.previewUrl || active?.error);
  });
  const noSlotInFlight = session.slots.every((slot) => !slot.inFlight);

  return {
    id: session.id,
    phase: session.phase,
    changeCreditsRemaining: session.changeCreditsRemaining,
    slots: session.slots.map((slot, index) => ({
      index,
      originalUrl: slot.originalUrl,
      activeCandidateId: slot.activeCandidateId,
      inFlight: slot.inFlight,
      candidates: slot.candidates,
    })),
    selectedColorStyle: session.selectedColorStyle,
    canRegenerate: inBwReview && hasCredits && noSlotInFlight,
    canReplace: inBwReview && hasCredits && noSlotInFlight,
    canApproveBw:
      inBwReview &&
      noSlotInFlight &&
      allSlotsReady &&
      session.slots.every((slot) => {
        const active = slot.candidates.find(
          (candidate) => candidate.id === slot.activeCandidateId,
        );
        return Boolean(active?.previewUrl && !active.error);
      }),
    canSelectStyle: session.phase === "bw_approved",
    canAddToCart: session.phase === "style_selected",
  };
}

export function getSelectedOriginalUrls(session: PreviewSession): string[] {
  return session.slots.map((slot) => slot.originalUrl);
}

export function getSelectedGeneratedBwUrls(session: PreviewSession): string[] {
  return session.slots.map((slot) => {
    const active = slot.candidates.find(
      (candidate) => candidate.id === slot.activeCandidateId,
    );
    if (!active?.cleanUrl) {
      throw new Error(`Missing selected B&W output for slot`);
    }
    return active.cleanUrl;
  });
}
