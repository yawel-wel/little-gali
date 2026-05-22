import type { StyleType } from "@/components/style-selector";
import { kvDel, kvGet, kvSet } from "@/lib/preview-session/kv";
import { cartImagesKey } from "@/lib/preview-session/redis";

const CART_IMAGES_TTL_SECONDS = 30 * 24 * 60 * 60;

export interface StoredCartImages {
  imageUrls: string[];
  originalUrls?: string[];
  generatedBwUrls?: string[];
  previewSessionId?: string;
  previewGenTotal?: number;
  previewGenSelected?: string;
  style?: StyleType;
}

export async function saveCartImages(
  cartId: string,
  lineId: string,
  payload: StoredCartImages,
): Promise<void> {
  await kvSet(cartImagesKey(cartId, lineId), payload, {
    ex: CART_IMAGES_TTL_SECONDS,
  });
}

export async function loadCartImages(
  cartId: string,
  lineId: string,
): Promise<StoredCartImages | null> {
  return (await kvGet<StoredCartImages>(cartImagesKey(cartId, lineId))) ?? null;
}

export async function deleteCartImages(
  cartId: string,
  lineId: string,
): Promise<void> {
  await kvDel(cartImagesKey(cartId, lineId));
}
