/**
 * Application-wide constants
 */

export const BOOK_PRICE = 145;
export const DISCOUNTED_BOOK_PRICE = 99;

/** Single framed-art line item (Shopify discount may reduce multi-item carts). */
export const FRAMED_ART_UNIT_PRICE = 129;
export const FRAMED_ART_TWO_PRICE = 218;
export const FRAMED_ART_THREE_PRICE = 289;

// Gift Card Configuration
export const GIFT_CARD_OPTIONS = [
  { id: 'one_with_shipping', price: 175, labelKey: 'giftCard.option2' },
  { id: 'two_with_shipping', price: 274, labelKey: 'giftCard.option4' },
] as const;

// Environment variables
// Add these to your .env.local:
// SHOPIFY_GIFT_CARD_VARIANT_ID_ONE_NO_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_GIFT_CARD_VARIANT_ID_ONE_WITH_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_GIFT_CARD_VARIANT_ID_TWO_NO_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_GIFT_CARD_VARIANT_ID_TWO_WITH_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
// SHOPIFY_FRAMED_ART_VARIANT_ID=43836272607335
// NEXT_PUBLIC_FRAMED_ART_ENABLED=true
