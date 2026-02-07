import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, attributes } = body as {
      cartId: string;
      attributes: Array<{ key: string; value: string }>;
    };

    if (!cartId || !attributes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    if (!storeDomain || !accessToken) {
      return NextResponse.json(
        { error: "Shopify credentials not configured" },
        { status: 500 }
      );
    }

    const cartAttributesUpdateMutation = `
      mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
        cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
          cart {
            id
            attributes {
              key
              value
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

    const variables = {
      cartId: cartId,
      attributes: attributes,
    };

    const response = await fetch(
      `https://${storeDomain}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: cartAttributesUpdateMutation,
          variables: variables,
        }),
      }
    );

    const result = await response.json();

    if (result.errors) {
      return NextResponse.json(
        {
          error: `Shopify API error: ${
            result.errors[0]?.message || "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    if (!result.data || !result.data.cartAttributesUpdate) {
      return NextResponse.json(
        { error: "Invalid response from Shopify" },
        { status: 500 }
      );
    }

    if (
      result.data.cartAttributesUpdate.userErrors &&
      result.data.cartAttributesUpdate.userErrors.length > 0
    ) {
      const errors = result.data.cartAttributesUpdate.userErrors;
      return NextResponse.json(
        {
          error: `Cart error: ${errors[0]?.message || "Unknown error"}`,
        },
        { status: 400 }
      );
    }

    const cart = result.data.cartAttributesUpdate.cart;

    if (!cart || !cart.id) {
      return NextResponse.json(
        { error: "Failed to update cart attributes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cart: {
        id: cart.id,
        attributes: cart.attributes,
      },
    });
  } catch (error: any) {
    console.error("Update cart attributes error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
