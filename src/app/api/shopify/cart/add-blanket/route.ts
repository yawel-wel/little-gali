import { NextRequest, NextResponse } from "next/server";
import {
  blanketVariantGid,
  isBlanketPattern,
  type BlanketPattern,
} from "@/lib/blanket";

export const runtime = "nodejs";

function blanketLineAttributes(pattern: BlanketPattern) {
  return [
    { key: "_product_type", value: "bamboo_blanket" },
    { key: "_pattern", value: pattern },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, pattern, locale } = body as {
      cartId?: string;
      pattern?: string;
      locale?: string;
    };

    if (!isBlanketPattern(pattern)) {
      return NextResponse.json(
        { error: "Missing or invalid blanket pattern" },
        { status: 400 },
      );
    }

    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    if (!storeDomain || !accessToken) {
      return NextResponse.json(
        { error: "Shopify credentials not configured" },
        { status: 500 },
      );
    }

    const productVariantId = blanketVariantGid(pattern);
    const lineInput = {
      merchandiseId: productVariantId,
      quantity: 1,
      attributes: blanketLineAttributes(pattern),
    };

    if (!cartId) {
      const cartCreateMutation = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
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
            query: cartCreateMutation,
            variables: { input: { lines: [lineInput] } },
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

      if (!result.data?.cartCreate) {
        return NextResponse.json(
          { error: "Invalid response from Shopify" },
          { status: 500 },
        );
      }

      if (result.data.cartCreate.userErrors.length > 0) {
        const errors = result.data.cartCreate.userErrors;
        return NextResponse.json(
          { error: `Cart error: ${errors[0]?.message || "Unknown error"}` },
          { status: 400 },
        );
      }

      const cart = result.data.cartCreate.cart;
      let checkoutUrl = cart.checkoutUrl;
      if (locale && (locale === "he" || locale === "en")) {
        const url = new URL(checkoutUrl);
        url.searchParams.set("locale", locale);
        checkoutUrl = url.toString();
      }

      return NextResponse.json({
        cart: {
          id: cart.id,
          checkoutUrl,
          totalQuantity: cart.totalQuantity,
          totalAmount: cart.cost?.totalAmount?.amount,
          currencyCode: cart.cost?.totalAmount?.currencyCode,
        },
      });
    }

    const cartLinesAddMutation = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
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
          query: cartLinesAddMutation,
          variables: { cartId, lines: [lineInput] },
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

    if (!result.data?.cartLinesAdd) {
      return NextResponse.json(
        { error: "Invalid response from Shopify" },
        { status: 500 },
      );
    }

    if (result.data.cartLinesAdd.userErrors.length > 0) {
      const errors = result.data.cartLinesAdd.userErrors;
      return NextResponse.json(
        { error: `Cart error: ${errors[0]?.message || "Unknown error"}` },
        { status: 400 },
      );
    }

    const cart = result.data.cartLinesAdd.cart;
    let checkoutUrl = cart.checkoutUrl;
    if (locale && (locale === "he" || locale === "en")) {
      const url = new URL(checkoutUrl);
      url.searchParams.set("locale", locale);
      checkoutUrl = url.toString();
    }

    return NextResponse.json({
      cart: {
        id: cart.id,
        checkoutUrl,
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.cost?.totalAmount?.amount,
        currencyCode: cart.cost?.totalAmount?.currencyCode,
      },
    });
  } catch (error: unknown) {
    console.error("Add blanket to cart error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
