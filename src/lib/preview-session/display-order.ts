import type { BookFlow } from "./book-flow";
import {
  defaultDisplayOrder,
  getSlotCount,
  parseBookFlow,
} from "./book-flow";
import type { PreviewSession, PreviewSessionPublicView } from "./types";

/** @deprecated Prefer getSlotCount(flow) — classic booklet slot count. */
export const PREVIEW_SLOT_COUNT = 5;

export const DEFAULT_DISPLAY_ORDER: number[] = defaultDisplayOrder("classic");

export function normalizeDisplayOrder(
  order: number[] | undefined,
  flowOrCount: BookFlow | number = "classic",
): number[] {
  const slotCount =
    typeof flowOrCount === "number"
      ? flowOrCount
      : getSlotCount(parseBookFlow(flowOrCount));
  const fallback = Array.from({ length: slotCount }, (_, index) => index);

  if (!order || order.length !== slotCount) {
    return fallback;
  }
  const seen = new Set(order);
  if (seen.size !== slotCount) {
    return fallback;
  }
  for (let index = 0; index < slotCount; index += 1) {
    if (!seen.has(index)) {
      return fallback;
    }
  }
  return [...order];
}

export function isValidDisplayOrder(
  order: unknown,
  flowOrCount: BookFlow | number = "classic",
): order is number[] {
  const slotCount =
    typeof flowOrCount === "number"
      ? flowOrCount
      : getSlotCount(parseBookFlow(flowOrCount));
  return (
    Array.isArray(order) &&
    order.length === slotCount &&
    normalizeDisplayOrder(order, slotCount).every(
      (value, index) => value === order[index],
    )
  );
}

type SessionSlots = PreviewSession["slots"] | PreviewSessionPublicView["slots"];

export function sortSlotsByDisplayOrder<T extends { index: number }>(
  slots: T[],
  displayOrder: number[] | undefined,
): T[] {
  const order = normalizeDisplayOrder(displayOrder, slots.length);
  const byIndex = new Map(slots.map((slot) => [slot.index, slot]));
  return order
    .map((slotIndex) => byIndex.get(slotIndex))
    .filter((slot): slot is T => Boolean(slot));
}

export function displayPosition(
  slotIndex: number,
  displayOrder: number[] | undefined,
  slotCount?: number,
): number {
  const order = normalizeDisplayOrder(
    displayOrder,
    slotCount ?? displayOrder?.length ?? PREVIEW_SLOT_COUNT,
  );
  const position = order.indexOf(slotIndex);
  return position >= 0 ? position + 1 : slotIndex + 1;
}

export function urlsInDisplayOrder(
  session: PreviewSession,
  pickUrl: (slot: PreviewSession["slots"][number]) => string,
): string[] {
  const flow = parseBookFlow(session.bookFlow);
  const order = normalizeDisplayOrder(session.displayOrder, flow);
  return order.map((slotIndex) => {
    const slot = session.slots[slotIndex];
    if (!slot) {
      throw new Error(`Missing preview slot ${slotIndex}`);
    }
    return pickUrl(slot);
  });
}

export function sessionSlotCount(
  session: Pick<PreviewSession, "slots" | "bookFlow">,
): number {
  if (session.slots.length > 0) {
    return session.slots.length;
  }
  return getSlotCount(parseBookFlow(session.bookFlow));
}
