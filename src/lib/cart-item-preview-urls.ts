import type { CartItem } from "@/lib/CartContext";
import { isValidBookCartImageCount } from "@/lib/preview-session/generation-stats";
import {
  COLORFUL_SLOT_COUNT,
  isColorfulImageCount,
} from "@/lib/preview-session/book-flow";

export type CartItemAvatarSlot = string | null;

export function getCartItemAvatarPreview(item: CartItem): {
  slots: CartItemAvatarSlot[];
  expectedCount: number;
  /** Colorful book (9 legacy or 10 color pages), not classic B&W + color. */
  isColorful?: boolean;
} {
  if (item.isBambooBlanket || item.isGiftCard) {
    return { slots: [], expectedCount: 0 };
  }

  if (item.isFramedArt) {
    const url = item.framedImageUrl ?? item.imageUrls?.[0] ?? null;
    return {
      slots: url ? [url] : [],
      expectedCount: url ? 1 : 0,
    };
  }

  const isColorful =
    item.bookFlow === "colorful" ||
    item.style === "colorful" ||
    isColorfulImageCount(item.generatedColorUrls?.length ?? 0) ||
    isColorfulImageCount(item.imageUrls?.length ?? 0);

  if (isColorful) {
    const generatedColor = item.generatedColorUrls ?? [];
    const imageUrls = item.imageUrls ?? [];
    const color = isColorfulImageCount(generatedColor.length)
      ? generatedColor
      : isColorfulImageCount(imageUrls.length)
        ? imageUrls
        : [];
    if (color.length > 0) {
      return { slots: [...color], expectedCount: color.length, isColorful: true };
    }
    const partial = item.imageUrls?.length
      ? item.imageUrls.slice(0, COLORFUL_SLOT_COUNT)
      : color;
    const slots: CartItemAvatarSlot[] = partial.map((url) => url);
    while (slots.length < COLORFUL_SLOT_COUNT) {
      slots.push(null);
    }
    return {
      slots: slots.slice(0, COLORFUL_SLOT_COUNT),
      expectedCount: COLORFUL_SLOT_COUNT,
      isColorful: true,
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

export function isBookCartImageCount(count: number): boolean {
  return isValidBookCartImageCount(count);
}
