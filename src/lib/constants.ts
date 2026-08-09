/**
 * Application-wide constants
 */

export const BOOK_PRICE = 190;
export const DISCOUNTED_BOOK_PRICE = 159;

/** Single framed-art line item (Shopify discount may reduce multi-item carts). */
export const FRAMED_ART_UNIT_PRICE = 119;
export const FRAMED_ART_TWO_PRICE = 219;
export const FRAMED_ART_THREE_PRICE = 299;

/** Soft book Shopify variant IDs (numeric strings). */
export const BOOK_VARIANT_IDS = {
  light: "43869379821671",
  dark: "43869379854439",
} as const;

// Gift Card Configuration
export const GIFT_CARD_OPTIONS = [
  { id: 'one_with_shipping', price: 220, labelKey: 'giftCard.option2' },
] as const;

// Environment variables
// Add these to your .env.local:
// SHOPIFY_GIFT_CARD_VARIANT_ID_ONE_NO_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_GIFT_CARD_VARIANT_ID_ONE_WITH_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_GIFT_CARD_VARIANT_ID_TWO_NO_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_GIFT_CARD_VARIANT_ID_TWO_WITH_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_FRAMED_ART_VARIANT_ID=43836272607335
// NEXT_PUBLIC_FRAMED_ART_ENABLED=true
