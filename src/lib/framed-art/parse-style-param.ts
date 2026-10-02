import type { StyleType } from "@/components/style-selector";

/** Styles offered for framed art. */
export const FRAMED_ART_STYLES: StyleType[] = ["pencil", "watercolor"];

export function parseFramedArtStyleParam(
  value: string | null | undefined,
): StyleType | null {
  if (!value) return null;
  return FRAMED_ART_STYLES.includes(value as StyleType) ? (value as StyleType) : null;
}
