export type BookFlow = "classic" | "colorful";

export const CLASSIC_SLOT_COUNT = 5;
export const COLORFUL_SLOT_COUNT = 10;
/**
 * Colorful books made before the 10-photo book (5 per side) had 9 photos.
 * Their sessions, carts and orders must keep working.
 */
export const LEGACY_COLORFUL_SLOT_COUNT = 9;

/** 9 (legacy) or 10 images = a colorful book. Classic books have 5. */
export function isColorfulImageCount(count: number): boolean {
  return count === COLORFUL_SLOT_COUNT || count === LEGACY_COLORFUL_SLOT_COUNT;
}

export function isBookFlow(value: unknown): value is BookFlow {
  return value === "classic" || value === "colorful";
}

export function parseBookFlow(value: unknown): BookFlow {
  return value === "colorful" ? "colorful" : "classic";
}

/** Read classic/colorful from Shopify cart line attributes. */
export function bookFlowFromLineAttributes(
  attributes: Array<{ key: string; value: string }> | undefined | null,
): BookFlow | undefined {
  const attr = attributes?.find(
    (item) =>
      item.key === "_book_flow" ||
      item.key === "book_flow" ||
      item.key === "type",
  );
  if (attr?.value === "colorful" || attr?.value === "classic") {
    return attr.value;
  }
  return undefined;
}

export function getSlotCount(flow: BookFlow = "classic"): number {
  return flow === "colorful" ? COLORFUL_SLOT_COUNT : CLASSIC_SLOT_COUNT;
}

export function defaultDisplayOrder(flow: BookFlow = "classic"): number[] {
  return Array.from({ length: getSlotCount(flow) }, (_, index) => index);
}

export function isValidBookImageCount(
  count: number,
  flow: BookFlow = "classic",
): boolean {
  return count === getSlotCount(flow);
}
