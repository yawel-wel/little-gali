/**
 * Application-wide constants
 */

function priceFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

/** List price shown on the soft-book page. Checkout still charges the Shopify variant price. */
export const BOOK_PRICE = priceFromEnv(process.env.NEXT_PUBLIC_BOOK_PRICE, 220);
/** Second-book promo price. Shopify applies the actual discount at checkout. */
export const DISCOUNTED_BOOK_PRICE = priceFromEnv(
  process.env.NEXT_PUBLIC_SECOND_BOOK_PRICE,
  189,
);
/** Gift card shown on the site. The charged amount is the Shopify gift-card variant. */
export const GIFT_CARD_PRICE = priceFromEnv(
  process.env.NEXT_PUBLIC_GIFT_CARD_PRICE,
  250,
);

/** Single framed-art line item (Shopify discount may reduce multi-item carts). */
export const FRAMED_ART_UNIT_PRICE = 119;
export const FRAMED_ART_TWO_PRICE = 219;
export const FRAMED_ART_THREE_PRICE = 299;

/** Soft book Shopify variant IDs (numeric strings). */
export const BOOK_VARIANT_IDS = {
  light: "43869379821671",
  dark: "43869379854439",
} as const;

/** Matching bamboo blanket (soft-book upsell). */
export const BLANKET_PRICE = 89;
export const BLANKET_VARIANT_IDS = {
  leopard: "44510336057447",
  dots: "44510336090215",
} as const;

/** Soft book + bamboo blanket birth package (gift set). */
export const BIRTH_PACKAGE_PRICE = priceFromEnv(
  process.env.NEXT_PUBLIC_GIFT_SET_PRICE,
  279,
);
/** Book → gift set upgrade in the cart: what the matching blanket costs on top of the book. */
export const GIFT_SET_BLANKET_UPGRADE_PRICE = BIRTH_PACKAGE_PRICE - BOOK_PRICE;
export const BIRTH_PACKAGE_PRODUCT_ID = "7751448199271";
export const BIRTH_PACKAGE_VARIANT_IDS = {
  dots: "44525569704039",
  leopard: "44525569736807",
} as const;

export function birthPackageVariantGid(
  pattern: keyof typeof BIRTH_PACKAGE_VARIANT_IDS = "dots",
): string {
  return `gid://shopify/ProductVariant/${BIRTH_PACKAGE_VARIANT_IDS[pattern]}`;
}

/** Gift card for the gift set (soft book + large bamboo blanket). */
export const GIFT_CARD_GIFT_SET_PRICE = priceFromEnv(
  process.env.NEXT_PUBLIC_GIFT_CARD_GIFT_SET_PRICE,
  309,
);

// Gift Card Configuration
// variantId: default Shopify variant; SHOPIFY_GIFT_CARD_VARIANT_ID_<ID> env var overrides it.
export const GIFT_CARD_OPTIONS: ReadonlyArray<{
  id: string;
  price: number;
  labelKey: string;
  /** Optional smaller line under the label (e.g. "includes shipping"). */
  noteKey?: string;
  variantId?: string;
}> = [
  {
    id: "one_with_shipping",
    price: GIFT_CARD_PRICE,
    labelKey: "giftCard.optionBook",
    noteKey: "giftCard.includesShipping",
  },
  {
    id: "gift_set",
    price: GIFT_CARD_GIFT_SET_PRICE,
    labelKey: "giftCard.optionGiftSet",
    noteKey: "giftCard.includesShipping",
    variantId: "43869388079207",
  },
];

// Environment variables
// Add these to your .env.local:
// SHOPIFY_GIFT_CARD_VARIANT_ID_ONE_NO_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_GIFT_CARD_VARIANT_ID_ONE_WITH_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_GIFT_CARD_VARIANT_ID_TWO_NO_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_GIFT_CARD_VARIANT_ID_TWO_WITH_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_FRAMED_ART_VARIANT_ID=43836272607335
// NEXT_PUBLIC_FRAMED_ART_ENABLED=true
// NEXT_PUBLIC_BOOK_PRICE=220
// NEXT_PUBLIC_SECOND_BOOK_PRICE=189
// NEXT_PUBLIC_GIFT_CARD_PRICE=250
// NEXT_PUBLIC_GIFT_SET_PRICE=279
