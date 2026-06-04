import { cartLineIdKey } from "@/lib/shopify/normalize-cart-line-id";

export function cartLineIdsMatch(a: string, b: string): boolean {
  return cartLineIdKey(a) === cartLineIdKey(b);
}
