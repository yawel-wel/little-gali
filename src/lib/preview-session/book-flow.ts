export type BookFlow = "classic" | "colorful";

export const CLASSIC_SLOT_COUNT = 5;
export const COLORFUL_SLOT_COUNT = 9;

export function isBookFlow(value: unknown): value is BookFlow {
  return value === "classic" || value === "colorful";
}

export function parseBookFlow(value: unknown): BookFlow {
  return value === "colorful" ? "colorful" : "classic";
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
