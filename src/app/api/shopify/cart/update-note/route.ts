import { NextRequest, NextResponse } from "next/server";
import { GIFT_MESSAGE_MAX_LENGTH } from "@/lib/shopify/cart-gift-note";

export const runtime = "nodejs";

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
          }
          userErrors {
            code
            field
            message
          }
        }
      }
    `;

    const response = await fetch(
      `https://${storeDomain}/api/2024-01/graphql.json`,
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

    return NextResponse.json({
      success: true,
      cart: {
        id: cart.id,
        note: cart.note ?? "",
        checkoutUrl: cart.checkoutUrl,
      },
    });
  } catch (error: unknown) {
    console.error("Update cart note error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
