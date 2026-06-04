import type { StyleType } from "@/components/style-selector";
import { kvDel, kvGet, kvSet } from "@/lib/preview-session/kv";
import { cartImagesKey } from "@/lib/preview-session/redis";

const CART_IMAGES_TTL_SECONDS = 30 * 24 * 60 * 60;

export interface StoredCartImages {
  imageUrls: string[];
  originalUrls?: string[];
  generatedBwUrls?: string[];
  generatedColorUrls?: string[];
  previewSessionId?: string;
  previewGenTotal?: number;
  previewGenSelected?: string;
  style?: StyleType;
  productType?: "book" | "framed_art";
  framedImageUrl?: string;
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

export async function loadCartImagesBatch(
  cartId: string,
  lineIds: string[],
): Promise<Record<string, StoredCartImages | null>> {
  const unique = [...new Set(lineIds)];
  const pairs = await Promise.all(
    unique.map(
      async (lineId) =>
        [lineId, await loadCartImages(cartId, lineId)] as const,
    ),
  );
  return Object.fromEntries(pairs);
}

export async function deleteCartImages(
  cartId: string,
  lineId: string,
): Promise<void> {
  await kvDel(cartImagesKey(cartId, lineId));
}
