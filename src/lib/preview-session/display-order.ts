import type { PreviewSession, PreviewSessionPublicView } from "./types";

export const PREVIEW_SLOT_COUNT = 5;

export const DEFAULT_DISPLAY_ORDER: number[] = [0, 1, 2, 3, 4];

export function normalizeDisplayOrder(
  order: number[] | undefined,
): number[] {
  if (!order || order.length !== PREVIEW_SLOT_COUNT) {
    return [...DEFAULT_DISPLAY_ORDER];
  }
  const seen = new Set(order);
  if (seen.size !== PREVIEW_SLOT_COUNT) {
    return [...DEFAULT_DISPLAY_ORDER];
  }
  for (let index = 0; index < PREVIEW_SLOT_COUNT; index += 1) {
    if (!seen.has(index)) {
      return [...DEFAULT_DISPLAY_ORDER];
    }
  }
  return [...order];
}

export function isValidDisplayOrder(order: unknown): order is number[] {
  return (
    Array.isArray(order) &&
    order.length === PREVIEW_SLOT_COUNT &&
    normalizeDisplayOrder(order).every((value, index) => value === order[index])
  );
}

type SessionSlots = PreviewSession["slots"] | PreviewSessionPublicView["slots"];

export function sortSlotsByDisplayOrder<T extends { index: number }>(
  slots: T[],
  displayOrder: number[] | undefined,
): T[] {
  const order = normalizeDisplayOrder(displayOrder);
  const byIndex = new Map(slots.map((slot) => [slot.index, slot]));
  return order
    .map((slotIndex) => byIndex.get(slotIndex))
    .filter((slot): slot is T => Boolean(slot));
}

export function displayPosition(
  slotIndex: number,
  displayOrder: number[] | undefined,
): number {
  const order = normalizeDisplayOrder(displayOrder);
  const position = order.indexOf(slotIndex);
  return position >= 0 ? position + 1 : slotIndex + 1;
}

export function urlsInDisplayOrder(
  session: PreviewSession,
  pickUrl: (slot: PreviewSession["slots"][number]) => string,
): string[] {
  const order = normalizeDisplayOrder(session.displayOrder);
  return order.map((slotIndex) => {
    const slot = session.slots[slotIndex];
    if (!slot) {
      throw new Error(`Missing preview slot ${slotIndex}`);
    }
    return pickUrl(slot);
  });
}
