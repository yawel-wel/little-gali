import { BLANKET_VARIANT_IDS } from "@/lib/constants";

export type BlanketPattern = keyof typeof BLANKET_VARIANT_IDS;

export const BLANKET_PATTERNS: BlanketPattern[] = ["dots", "leopard"];

export const DEFAULT_BLANKET_PATTERN: BlanketPattern = "dots";

/** Cart / upsell thumbnail (first gallery image per pattern). */
export const BLANKET_PRODUCT_IMAGES: Record<BlanketPattern, string> = {
  dots: "/blanket-product-dots-1.jpg",
  leopard: "/blanket-product-leopard-1.jpg",
};

/**
 * PDP gallery — replace these files in /public:
 *   blanket-product-dots-1.jpg … blanket-product-dots-4.jpg
 *   blanket-product-leopard-1.jpg … blanket-product-leopard-4.jpg
 */
export const BLANKET_PRODUCT_GALLERY: Record<BlanketPattern, readonly string[]> = {
  dots: [
    "/blanket-product-dots-1.jpg",
    "/blanket-product-dots-2.jpg",
    "/blanket-product-dots-3.jpg",
    "/blanket-product-dots-4.jpg",
  ],
  leopard: [
    "/blanket-product-leopard-1.jpg",
    "/blanket-product-leopard-2.jpg",
    "/blanket-product-leopard-3.jpg",
    "/blanket-product-leopard-4.jpg",
  ],
};

export const BLANKET_SWATCH_IMAGES: Record<BlanketPattern, string> = {
  dots: "/blanket-swatch-dots.png",
  leopard: "/blanket-swatch-leopard.png",
};

export const BLANKET_PATTERN_LABEL_KEYS: Record<BlanketPattern, string> = {
  dots: "product.blanket.pattern.dots",
  leopard: "product.blanket.pattern.leopard",
};

export function isBlanketPattern(value: string | undefined | null): value is BlanketPattern {
  return value === "dots" || value === "leopard";
}

export function blanketVariantGid(pattern: BlanketPattern): string {
  return `gid://shopify/ProductVariant/${BLANKET_VARIANT_IDS[pattern]}`;
}

export function blanketPatternFromVariantId(
  variantId: string | undefined | null,
): BlanketPattern | undefined {
  if (!variantId) return undefined;
  const numeric = variantId.replace(/^gid:\/\/shopify\/ProductVariant\//, "");
  if (numeric === BLANKET_VARIANT_IDS.dots) return "dots";
  if (numeric === BLANKET_VARIANT_IDS.leopard) return "leopard";
  return undefined;
}
