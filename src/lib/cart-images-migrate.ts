import {
  deleteCartImages,
  loadCartImages,
  saveCartImages,
} from "@/lib/cart-images-store";
import { cartLineIdKey } from "@/lib/shopify/normalize-cart-line-id";

/** Copy KV image payload when a cart line is replaced (new Shopify line id). */
export async function migrateCartImagesToLine(
  cartId: string,
  fromLineId: string,
  toLineId: string,
  /** Extra line id(s) to try (e.g. client-sent id vs Shopify canonical id). */
  ...extraFromLineIds: string[]
): Promise<void> {
  if (cartLineIdKey(fromLineId) === cartLineIdKey(toLineId)) {
    return;
  }

  const fromCandidates = [
    fromLineId,
    ...extraFromLineIds,
  ].filter((id, index, list) => id && list.indexOf(id) === index);

  let payload: Awaited<ReturnType<typeof loadCartImages>> = null;
  let foundFromId: string | null = null;
  for (const candidate of fromCandidates) {
    payload = await loadCartImages(cartId, candidate);
    if (payload) {
      foundFromId = candidate;
      break;
    }
  }

  if (!payload || !foundFromId) {
    return;
  }

  await saveCartImages(cartId, toLineId, payload);
  for (const candidate of fromCandidates) {
    if (cartLineIdKey(candidate) !== cartLineIdKey(toLineId)) {
      await deleteCartImages(cartId, candidate);
    }
  }
}
