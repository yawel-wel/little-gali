import type { CartItem } from "@/lib/CartContext";
import {
  BOOK_PRICE,
  DISCOUNTED_BOOK_PRICE,
  FRAMED_ART_UNIT_PRICE,
} from "@/lib/constants";
import { resolveCartLinePrice } from "@/components/cart-line-price";

export function getBookLinePriceFallback(displayIndex: number) {
  return displayIndex % 2 === 0
    ? { total: DISCOUNTED_BOOK_PRICE, compare: BOOK_PRICE }
    : { total: BOOK_PRICE };
}

function getCatalogUnitPrice(
  item: CartItem,
  bookDisplayIndex?: number,
): number {
  if (item.isGiftCard) {
    return item.giftCardAmount ?? 0;
  }
  if (item.isFramedArt) {
    return FRAMED_ART_UNIT_PRICE;
  }
  if (bookDisplayIndex != null) {
    const bookFallback = getBookLinePriceFallback(bookDisplayIndex);
    return bookFallback.compare ?? bookFallback.total;
  }
  return BOOK_PRICE;
}

export function getCartItemLinePricing(
  item: CartItem,
  bookDisplayIndex?: number,
): { unitPrice: number; lineTotal: number } {
  const quantity = item.quantity > 0 ? item.quantity : 1;

  let fallback = { total: 0 };
  if (item.isGiftCard) {
    fallback = { total: item.giftCardAmount ?? 0 };
  } else if (item.isFramedArt) {
    fallback = { total: FRAMED_ART_UNIT_PRICE };
  } else if (bookDisplayIndex != null) {
    fallback = getBookLinePriceFallback(bookDisplayIndex);
  }

  const linePrice = resolveCartLinePrice(item, fallback);
  const lineTotal = linePrice.total;

  // Header unit price: list price per item (not discounted average).
  const unitPrice =
    linePrice.compare != null && linePrice.compare > lineTotal + 0.009
      ? linePrice.compare / quantity
      : getCatalogUnitPrice(item, bookDisplayIndex);

  return { unitPrice, lineTotal };
}

/** True when the line total is below list price × quantity. */
export function cartLineHasDiscount(
  unitPrice: number,
  quantity: number,
  lineTotal: number,
): boolean {
  const qty = quantity > 0 ? quantity : 1;
  const listTotal = unitPrice * qty;
  return lineTotal < listTotal - 0.009;
}
