import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, lineIds } = body as {
      cartId: string;
      lineIds: string[];
    };

    if (!cartId || !lineIds || lineIds.length === 0) {
      return NextResponse.json(
        { error: "Cart ID and line IDs are required" },
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

    const cartLinesRemoveMutation = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                      }
                    }
                  }
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

    const response = await fetch(
      `https://${storeDomain}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: cartLinesRemoveMutation,
          variables: {
            cartId: cartId,
            lineIds: lineIds,
          },
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

    if (!result.data || !result.data.cartLinesRemove) {
      return NextResponse.json(
        { error: "Invalid response from Shopify" },
        { status: 500 }
      );
    }

    if (result.data.cartLinesRemove.userErrors.length > 0) {
      const errors = result.data.cartLinesRemove.userErrors;
      return NextResponse.json(
        {
          error: `Cart error: ${errors[0]?.message || "Unknown error"}`,
        },
        { status: 400 }
      );
    }

    const cart = result.data.cartLinesRemove.cart;

    // Clean up images from our separate storage for removed line items
    if (lineIds && lineIds.length > 0) {
      try {
        await Promise.all(
          lineIds.map((lineId: string) =>
            fetch(
              `${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/api/cart-images?cartId=${cartId}&lineId=${lineId}`,
              {
                method: "DELETE",
              }
            )
          )
        );
      } catch (error) {
        console.error("Error cleaning up cart images:", error);
        // Continue even if cleanup fails
      }
    }

    return NextResponse.json({
      cart: {
        id: cart.id,
        checkoutUrl: cart.checkoutUrl,
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.cost?.totalAmount?.amount,
        currencyCode: cart.cost?.totalAmount?.currencyCode,
      },
    });
  } catch (error: any) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
