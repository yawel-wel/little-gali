import { BOOK_VARIANT_IDS } from "@/lib/constants";

export type BookColor = "dark" | "light";

export const DEFAULT_BOOK_COLOR: BookColor = "light";

export const BOOK_COLOR_SWATCHES: Record<BookColor, string> = {
  dark: "/book-color-swatch-dark.png",
  light: "/book-color-swatch-light.png",
};

export const BOOK_COLOR_LABEL_KEYS: Record<BookColor, string> = {
  dark: "preview.bookColor.dark",
  light: "preview.bookColor.light",
};

export function normalizeVariantId(
  variantId: string | undefined | null,
): string | null {
  if (!variantId) {
    return null;
  }
  const match = variantId.match(/(\d+)$/);
  return match ? match[1] : null;
}

export function bookColorFromVariantId(
  variantId: string | undefined | null,
): BookColor | null {
  const normalized = normalizeVariantId(variantId);
  if (!normalized) {
    return null;
  }
  if (normalized === BOOK_VARIANT_IDS.dark) {
    return "dark";
  }
  if (normalized === BOOK_VARIANT_IDS.light) {
    return "light";
  }
  return null;
}

export function resolveBookVariantGid(bookColor?: BookColor | null): string {
  const color = bookColor === "dark" ? "dark" : "light";
  return `gid://shopify/ProductVariant/${BOOK_VARIANT_IDS[color]}`;
}

export function isValidBookColor(value: unknown): value is BookColor {
  return value === "dark" || value === "light";
}
