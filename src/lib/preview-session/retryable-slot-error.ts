import type { StyleType } from "@/components/style-selector";
import { getColorCandidateForStyle } from "./color-by-style";
import type { GenerationError, PreviewSlot } from "./types";

export function isRetryableGenerationError(
  error?: GenerationError,
): error is GenerationError {
  return Boolean(error && error.code !== "prohibited_content");
}

export function slotBwActiveHasRetryableError(slot: PreviewSlot): boolean {
  const active = slot.candidates.find(
    (candidate) =>
      candidate.kind === "bw" && candidate.id === slot.activeCandidateId,
  );
  return isRetryableGenerationError(active?.error);
}

export function slotColorActiveHasRetryableError(
  slot: PreviewSlot,
  style: StyleType,
): boolean {
  const color = getColorCandidateForStyle(slot, style);
  return isRetryableGenerationError(color?.error);
}
