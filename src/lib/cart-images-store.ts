import type { StyleType } from "@/components/style-selector";
import { cartImagesKey, getRedis } from "@/lib/preview-session/redis";

const CART_IMAGES_TTL_SECONDS = 30 * 24 * 60 * 60;

export interface StoredCartImages {
  imageUrls: string[];
  originalUrls?: string[];
  generatedBwUrls?: string[];
  previewSessionId?: string;
  style?: StyleType;
}

export async function saveCartImages(
  cartId: string,
  lineId: string,
  payload: StoredCartImages,
): Promise<void> {
  const redis = getRedis();
  await redis.set(cartImagesKey(cartId, lineId), payload, {
    ex: CART_IMAGES_TTL_SECONDS,
  });
}

export async function loadCartImages(
  cartId: string,
  lineId: string,
): Promise<StoredCartImages | null> {
  const redis = getRedis();
  return (await redis.get<StoredCartImages>(cartImagesKey(cartId, lineId))) ?? null;
}

export async function deleteCartImages(
  cartId: string,
  lineId: string,
): Promise<void> {
  const redis = getRedis();
  await redis.del(cartImagesKey(cartId, lineId));
}
