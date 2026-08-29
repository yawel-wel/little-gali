import { getPreviewColorStyles, slotHasColorPreviewForStyle } from "./color-by-style";
import type { PreviewSession, PreviewSlot } from "./types";

export function enqueuePendingColorRegen(
  session: PreviewSession,
  slotIndex: number,
): void {
  const pending = session.pendingColorRegenSlotIndexes ?? [];
  if (!pending.includes(slotIndex)) {
    session.pendingColorRegenSlotIndexes = [...pending, slotIndex];
  }
}

export function dequeuePendingColorRegen(
  session: PreviewSession,
  slotIndex: number,
): void {
  const pending = session.pendingColorRegenSlotIndexes;
  if (!pending?.length) {
    return;
  }
  session.pendingColorRegenSlotIndexes = pending.filter(
    (index) => index !== slotIndex,
  );
  if (session.pendingColorRegenSlotIndexes.length === 0) {
    delete session.pendingColorRegenSlotIndexes;
  }
}

export function slotNeedsAllStylesColorRegen(slot: PreviewSlot): boolean {
  return getPreviewColorStyles().some(
    (style) => !slotHasColorPreviewForStyle(slot, style),
  );
}
