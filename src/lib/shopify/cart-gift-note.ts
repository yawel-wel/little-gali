export const GIFT_MESSAGE_MAX_LENGTH = 200;

const LEGACY_BOOK_CART_NOTE_PREFIX = "ספר מותאם אישית";

export function normalizeGiftMessage(message: string): string {
  return message.slice(0, GIFT_MESSAGE_MAX_LENGTH);
}

/** Ignore leftover internal book labels so they never fill the gift textarea. */
export function giftMessageFromCartNote(
  note: string | null | undefined,
): string {
  const trimmed = (note ?? "").trim();
  if (!trimmed || trimmed.startsWith(LEGACY_BOOK_CART_NOTE_PREFIX)) {
    return "";
  }
  return normalizeGiftMessage(trimmed);
}

export function checkoutUrlWithLocale(
  checkoutUrl: string,
  locale: string,
): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("locale", locale);
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

export async function saveCartGiftNote(
  cartId: string,
  note: string,
): Promise<{ note: string; checkoutUrl: string }> {
  const response = await fetch("/api/shopify/cart/update-note", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cartId,
      note: normalizeGiftMessage(note),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save gift message");
  }

  const data = (await response.json()) as {
    cart?: { note?: string; checkoutUrl?: string };
  };

  if (!data.cart?.checkoutUrl) {
    throw new Error("Failed to save gift message");
  }

  return {
    note: data.cart.note ?? "",
    checkoutUrl: data.cart.checkoutUrl,
  };
}
