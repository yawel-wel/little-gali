import type { StyleType } from "@/components/style-selector";
import { getColorCandidateForStyle } from "./color-by-style";
import { isFreeGenerationError } from "./generation-errors";
import { isPreviewLimitsBypassed } from "./preview-limits-bypass";
import type { GenerationError, PreviewSession } from "./types";

export const INITIAL_CHANGE_CREDITS = 15;

export function hasChangeCredits(session: PreviewSession): boolean {
  if (isPreviewLimitsBypassed()) {
    return true;
  }
  return session.changeCreditsRemaining > 0;
}

export function consumeChangeCredit(session: PreviewSession): void {
  if (isPreviewLimitsBypassed()) {
    return;
  }
  if (session.changeCreditsRemaining <= 0) {
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
