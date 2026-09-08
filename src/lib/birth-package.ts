import {
  birthPackageVariantGid,
  BIRTH_PACKAGE_VARIANT_IDS,
} from "@/lib/constants";
import {
  isValidBookColor,
  normalizeVariantId,
  resolveBookVariantGid,
  type BookColor,
} from "@/lib/book-color";
import {
  DEFAULT_BLANKET_PATTERN,
  isBlanketPattern,
  type BlanketPattern,
} from "@/lib/blanket";

export function isBirthPackageVariantId(
  variantId: string | undefined | null,
): boolean {
  const normalized = normalizeVariantId(variantId);
  return (
    normalized === BIRTH_PACKAGE_VARIANT_IDS.dots ||
    normalized === BIRTH_PACKAGE_VARIANT_IDS.leopard
  );
}

export function blanketPatternFromBirthPackageVariantId(
  variantId: string | undefined | null,
): BlanketPattern | undefined {
  const normalized = normalizeVariantId(variantId);
  if (normalized === BIRTH_PACKAGE_VARIANT_IDS.dots) return "dots";
  if (normalized === BIRTH_PACKAGE_VARIANT_IDS.leopard) return "leopard";
  return undefined;
}

export function resolveCartMerchandiseGid(options: {
  isBirthPackage?: boolean;
  bookColor?: BookColor | null;
  blanketPattern?: BlanketPattern | null;
}): string {
  if (options.isBirthPackage) {
    const pattern = isBlanketPattern(options.blanketPattern)
      ? options.blanketPattern
      : DEFAULT_BLANKET_PATTERN;
    return birthPackageVariantGid(pattern);
  }
  return resolveBookVariantGid(
    isValidBookColor(options.bookColor) ? options.bookColor : undefined,
  );
}

/** Extra Shopify line attributes for birth-package (gift set) lines. */
export function birthPackageShopifyAttributes(options: {
  isBirthPackage?: boolean;
  blanketPattern?: BlanketPattern | null;
  bookColor?: BookColor | null;
}): Array<{ key: string; value: string }> {
  if (!options.isBirthPackage) return [];

  const attrs: Array<{ key: string; value: string }> = [
    { key: "_product_type", value: "birth_package" },
  ];

  if (isBlanketPattern(options.blanketPattern)) {
    attrs.push(
      { key: "_blanket_pattern", value: options.blanketPattern },
      { key: "_pattern", value: options.blanketPattern },
    );
  }

  if (isValidBookColor(options.bookColor)) {
    attrs.push({ key: "_book_color", value: options.bookColor });
  }

  return attrs;
}

export function blanketPatternFromLineAttributes(
  attributes: Array<{ key: string; value: string }> | undefined,
): BlanketPattern | undefined {
  if (!attributes?.length) return undefined;
  const raw =
    attributes.find((a) => a.key === "_blanket_pattern")?.value ??
    attributes.find((a) => a.key === "_pattern")?.value;
  return isBlanketPattern(raw) ? raw : undefined;
}

export function bookColorFromLineAttributes(
  attributes: Array<{ key: string; value: string }> | undefined,
): BookColor | undefined {
  if (!attributes?.length) return undefined;
  const raw = attributes.find((a) => a.key === "_book_color")?.value;
  return isValidBookColor(raw) ? raw : undefined;
}

export function isBirthPackageFromAttributes(
  attributes: Array<{ key: string; value: string }> | undefined,
): boolean {
  return Boolean(
    attributes?.some(
      (a) => a.key === "_product_type" && a.value === "birth_package",
    ),
  );
}
