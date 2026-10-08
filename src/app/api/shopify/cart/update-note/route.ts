import { reportError } from "@/lib/report-error";
import { NextRequest, NextResponse } from "next/server";
import { GIFT_MESSAGE_MAX_LENGTH } from "@/lib/shopify/cart-gift-note";

export const runtime = "nodejs";

/**
 * Gift card lines carry a copy of the gift message, because Shopify's "New gift card"
 * email can read the gift card's line attributes but not the order note.
 */
const GIFT_CARD_MESSAGE_KEY = "_gift_card_message";

type CartLineNode = {
  id: string;
  attributes: Array<{ key: string; value: string | null }>;
};

/** add-gift-card always sets `_type: gift_card`. */
function isGiftCardLine(line: CartLineNode): boolean {
  return line.attributes.some((a) => a.key === "_type" && a.value === "gift_card");
}

/** Copy the gift message onto gift card lines. Best effort: never blocks checkout. */
async function syncGiftCardMessage(
  endpoint: string,
  accessToken: string,
  cartId: string,
  lines: CartLineNode[],
  note: string,
): Promise<void> {
  const message = note.trim();
  const updates = lines
    .filter(isGiftCardLine)
    .map((line) => {
      const current =
        line.attributes.find((a) => a.key === GIFT_CARD_MESSAGE_KEY)?.value ?? "";
      if (current === message) return null;
      const attributes = line.attributes
        .filter((a) => a.key !== GIFT_CARD_MESSAGE_KEY)
        .map((a) => ({ key: a.key, value: a.value ?? "" }));
      if (message) {
        attributes.push({ key: GIFT_CARD_MESSAGE_KEY, value: message });
      }
      return { id: line.id, attributes };
    })
    .filter((update) => update !== null);

  if (updates.length === 0) return;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `
          mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
            cartLinesUpdate(cartId: $cartId, lines: $lines) {
              userErrors { code field message }
            }
          }
        `,
        variables: { cartId, lines: updates },
      }),
    });
    const result = await response.json();
    const userErrors = result.data?.cartLinesUpdate?.userErrors ?? [];
    if (result.errors || userErrors.length > 0) {
      reportError(
        "Copy gift message to gift card failed",
        result.errors ?? userErrors,
        { area: "cart" },
      );
    }
  } catch (error) {
    reportError("Copy gift message to gift card failed", error, { area: "cart" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, note: noteRaw } = body as {
      cartId?: string;
      note?: string;
    };

    if (!cartId || typeof noteRaw !== "string") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const note = noteRaw.slice(0, GIFT_MESSAGE_MAX_LENGTH);

    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    if (!storeDomain || !accessToken) {
      return NextResponse.json(
        { error: "Shopify credentials not configured" },
        { status: 500 },
      );
    }

    const cartNoteUpdateMutation = `
      mutation cartNoteUpdate($cartId: ID!, $note: String!) {
        cartNoteUpdate(cartId: $cartId, note: $note) {
          cart {
            id
            note
            checkoutUrl
            lines(first: 100) {
              edges {
                node {
                  id
                  attributes { key value }
                }
              }
            }
          }
          userErrors {
            code
            field
            message
          }
        }
      }
    `;

    const endpoint = `https://${storeDomain}/api/2024-01/graphql.json`;
    const response = await fetch(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: cartNoteUpdateMutation,
          variables: { cartId, note },
        }),
      },
    );

    const result = await response.json();

    if (result.errors) {
      reportError("Update cart note failed: Shopify API error", result.errors, { area: "cart" });
      return NextResponse.json(
        {
          error: `Shopify API error: ${
            result.errors[0]?.message || "Unknown error"
          }`,
        },
        { status: 500 },
      );
    }

    if (!result.data || !result.data.cartNoteUpdate) {
      reportError("Update cart note failed: unexpected Shopify response", result, { area: "cart" });
      return NextResponse.json(
        { error: "Invalid response from Shopify" },
        { status: 500 },
      );
    }

    if (
      result.data.cartNoteUpdate.userErrors &&
      result.data.cartNoteUpdate.userErrors.length > 0
    ) {
      const errors = result.data.cartNoteUpdate.userErrors;
      reportError("Update cart note failed: Shopify userErrors", errors, { area: "cart" });
      return NextResponse.json(
        {
          error: `Cart error: ${errors[0]?.message || "Unknown error"}`,
        },
        { status: 400 },
      );
    }

    const cart = result.data.cartNoteUpdate.cart;

    if (!cart || !cart.id || !cart.checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to update cart note" },
        { status: 500 },
      );
    }

    const lines: CartLineNode[] = (cart.lines?.edges ?? []).map(
      (edge: { node: CartLineNode }) => edge.node,
    );
    await syncGiftCardMessage(endpoint, accessToken, cartId, lines, cart.note ?? "");

    return NextResponse.json({
      success: true,
      cart: {
        id: cart.id,
        note: cart.note ?? "",
        checkoutUrl: cart.checkoutUrl,
      },
    });
  } catch (error: unknown) {
    reportError("Update cart note failed", error, { area: "cart" });
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
