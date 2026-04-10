/**
 * Application-wide constants
 */

export const BOOK_PRICE = 145;
export const DISCOUNTED_BOOK_PRICE = 99;

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
