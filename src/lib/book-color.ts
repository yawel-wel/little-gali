import { BOOK_VARIANT_IDS } from "@/lib/constants";

export type BookColor = "dark" | "light";

export const DEFAULT_BOOK_COLOR: BookColor = "light";

export const BOOK_COLOR_SWATCHES: Record<BookColor, string> = {
  dark: "/book-color-swatch-dark.png",
  light: "/book-color-swatch-light.png",
};

/** Product page gallery — 6 images per color variant. */
export const BOOK_PRODUCT_GALLERY: Record<BookColor, readonly string[]> = {
  light: [
    "/book-product-light-1.JPG",
    "/book-product-light-2.JPG",
    "/book-product-light-3.jpg",
    "/book-product-light-4.jpg",
    "/book-product-light-5.JPG",
    "/book-product-light-6.JPG",
  ],
  dark: [
    "/book-product-dark-1.JPG",
    "/book-product-dark-2.JPG",
    "/book-product-dark-3.jpg",
    "/book-product-dark-4.JPG",
    "/book-product-dark-5.JPG",
    "/book-product-dark-6.JPG",
  ],
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

const PREFERRED_BOOK_COLOR_KEY = "lg_preferred_book_color";

/** Persist product-page color choice for preview / cart. */
export function getPreferredBookColor(): BookColor | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(PREFERRED_BOOK_COLOR_KEY);
    return isValidBookColor(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function setPreferredBookColor(color: BookColor): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(PREFERRED_BOOK_COLOR_KEY, color);
  } catch {
    // ignore quota / private mode
  }
}
