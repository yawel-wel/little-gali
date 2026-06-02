import type { StyleType } from "@/components/style-selector";

const VALID_STYLES: StyleType[] = ["cartoon", "pencil", "watercolor"];

export function parseFramedArtStyleParam(
  value: string | null | undefined,
): StyleType | null {
  if (!value) return null;
  return VALID_STYLES.includes(value as StyleType) ? (value as StyleType) : null;
}
