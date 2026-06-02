import type { CartItem } from "@/lib/CartContext";

export type CartItemAvatarSlot = string | null;

export function getCartItemAvatarPreview(item: CartItem): {
  slots: CartItemAvatarSlot[];
  expectedCount: number;
} {
  if (item.isFramedArt) {
    const url = item.framedImageUrl ?? item.imageUrls?.[0] ?? null;
    return {
      slots: url ? [url] : [],
      expectedCount: url ? 1 : 0,
    };
  }

  const bw =
    item.generatedBwUrls?.length === 5
      ? item.generatedBwUrls
      : item.imageUrls?.length === 5
        ? item.imageUrls
        : [];

  const color =
    item.generatedColorUrls?.length === 5 ? item.generatedColorUrls : [];

  const wantsTen = Boolean(item.previewSessionId) || color.length === 5;

  if (wantsTen) {
    const slots: CartItemAvatarSlot[] = [];
    for (let i = 0; i < 5; i++) {
      slots.push(bw[i] ?? null);
    }
    for (let i = 0; i < 5; i++) {
      slots.push(color[i] ?? null);
    }
    return { slots, expectedCount: 10 };
  }

  if (bw.length === 5) {
    return { slots: [...bw], expectedCount: 5 };
  }

  const partial = item.imageUrls?.length
    ? item.imageUrls.slice(0, 5)
    : bw.length > 0
      ? bw
      : [];
  if (partial.length === 0) {
    return { slots: [], expectedCount: 0 };
  }

  const slots: CartItemAvatarSlot[] = partial.map((url) => url);
  while (slots.length < 5) {
    slots.push(null);
  }
  return { slots: slots.slice(0, 5), expectedCount: 5 };
}
