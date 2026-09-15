import type { StyleType } from "@/components/style-selector";
import { getColorCandidateForStyle } from "./color-by-style";
import { isFreeGenerationError } from "./generation-errors";
import { isPreviewLimitsBypassed } from "./preview-limits-bypass";
import type { GenerationError, PreviewSession } from "./types";

const DEFAULT_CHANGE_CREDITS = 5;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value?.trim()) {
    return fallback;
  }
  const parsed = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

/** Allowed regenerate/replace credits per preview session. Override via PREVIEW_CHANGE_CREDITS. */
export function getInitialChangeCredits(): number {
  return parsePositiveInt(
    process.env.PREVIEW_CHANGE_CREDITS,
    DEFAULT_CHANGE_CREDITS,
  );
}

export function effectiveChangeCreditsRemaining(
  session: PreviewSession,
): number {
  return Math.min(session.changeCreditsRemaining, getInitialChangeCredits());
}

export function hasChangeCredits(session: PreviewSession): boolean {
  if (isPreviewLimitsBypassed()) {
    return true;
  }
  return effectiveChangeCreditsRemaining(session) > 0;
}

export function consumeChangeCredit(session: PreviewSession): void {
  if (isPreviewLimitsBypassed()) {
    return;
  }
  if (effectiveChangeCreditsRemaining(session) <= 0) {
    throw new Error("No change credits remaining");
  }
  session.changeCreditsRemaining -= 1;
}

export function consumeChangeCreditForResult(
  session: PreviewSession,
  error?: GenerationError,
): void {
  if (!isFreeGenerationError(error)) {
    consumeChangeCredit(session);
  }
}

export function slotBwCandidateHasProhibitedContent(
  session: PreviewSession,
  slotIndex: number,
): boolean {
  const slot = session.slots[slotIndex];
  if (!slot) {
    return false;
  }
  const active = slot.candidates.find(
    (candidate) =>
      candidate.kind === "bw" && candidate.id === slot.activeCandidateId,
  );
  return active?.error?.code === "prohibited_content";
}

export function slotHasProhibitedContentForReplace(
  session: PreviewSession,
  slotIndex: number,
  colorStyle?: StyleType,
): boolean {
  if (slotBwCandidateHasProhibitedContent(session, slotIndex)) {
    return true;
  }
  const style = colorStyle ?? session.selectedColorStyle ?? "pencil";
  const slot = session.slots[slotIndex];
  if (!slot) {
    return false;
  }
  const activeColor = getColorCandidateForStyle(slot, style);
  return activeColor?.error?.code === "prohibited_content";
}
