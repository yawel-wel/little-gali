import { NextRequest, NextResponse } from "next/server";
import { GIFT_CARD_OPTIONS } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, optionId, locale } = body as {
      cartId?: string;
      optionId: string;
      locale?: string;
    };

    if (!optionId) {
      return NextResponse.json(
        { error: "Missing gift card option" },
        { status: 400 }
      );
    }

    // Get the gift card amount from the option
    const giftCardOption = GIFT_CARD_OPTIONS.find((opt) => opt.id === optionId);
    const giftCardAmount = giftCardOption?.price || 0;

    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    // Get the variant ID based on the option
    const variantKey = `SHOPIFY_GIFT_CARD_VARIANT_ID_${optionId.toUpperCase()}`;
    let productVariantId = process.env[variantKey];

    if (!storeDomain || !accessToken) {
      return NextResponse.json(
        { error: "Shopify credentials not configured" },
        { status: 500 }
      );
    }

    if (!productVariantId) {
      return NextResponse.json(
        {
          error: `Gift card variant not configured for option ${optionId}. Please add ${variantKey} to your environment variables.`,
        },
        { status: 500 }
      );
    }

    // Ensure variant ID is in GraphQL format
    if (!productVariantId.startsWith("gid://shopify/ProductVariant/")) {
      if (/^\d+$/.test(productVariantId)) {
        productVariantId = `gid://shopify/ProductVariant/${productVariantId}`;
      }
    }

    // If no cartId, create a new cart
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

      const variables = {
        input: {
          lines: [
            {
              merchandiseId: productVariantId,
              quantity: 1,
              attributes: [
                {
                  key: "_uid",
                  value: Math.random().toString(36).slice(2),
                },
                {
                  key: "_type",
                  value: "gift_card",
                },
                {
                  key: "_gift_card_amount",
                  value: giftCardAmount.toString(),
                },
              ],
            },
          ],
        },
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
            query: cartCreateMutation,
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

      if (!result.data || !result.data.cartCreate) {
        return NextResponse.json(
          { error: "Invalid response from Shopify" },
          { status: 500 }
        );
      }

      if (result.data.cartCreate.userErrors.length > 0) {
        const errors = result.data.cartCreate.userErrors;
        return NextResponse.json(
          {
            error: `Cart error: ${errors[0]?.message || "Unknown error"}`,
          },
          { status: 400 }
        );
      }

      const cart = result.data.cartCreate.cart;

      // Append locale to checkout URL if provided
      let checkoutUrl = cart.checkoutUrl;
      if (locale && (locale === "he" || locale === "en")) {
        const url = new URL(checkoutUrl);
        url.searchParams.set("locale", locale);
        checkoutUrl = url.toString();
      }

      return NextResponse.json({
        cart: {
          id: cart.id,
          checkoutUrl: checkoutUrl,
          totalQuantity: cart.totalQuantity,
          totalAmount: cart.cost?.totalAmount?.amount,
          currencyCode: cart.cost?.totalAmount?.currencyCode,
          items:
            cart.lines?.edges?.map((e: any) => ({
              id: e.node.id,
              lineId: e.node.id,
              quantity: e.node.quantity,
              title:
                e.node.merchandise?.product?.title ||
                e.node.merchandise?.title ||
                "Gift Card",
              isGiftCard: true,
              giftCardAmount: giftCardAmount,
              imageUrls: [],
            })) || [],
        },
      });
    }

    // Add to existing cart
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

    const variables = {
      cartId: cartId,
      lines: [
        {
          merchandiseId: productVariantId,
          quantity: 1,
          attributes: [
            {
              key: "_uid",
              value: Math.random().toString(36).slice(2),
            },
            {
              key: "_type",
              value: "gift_card",
            },
            {
              key: "_gift_card_amount",
              value: giftCardAmount.toString(),
            },
          ],
        },
      ],
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
          query: cartLinesAddMutation,
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

    if (!result.data || !result.data.cartLinesAdd) {
      return NextResponse.json(
        { error: "Invalid response from Shopify" },
        { status: 500 }
      );
    }

    if (result.data.cartLinesAdd.userErrors.length > 0) {
      const errors = result.data.cartLinesAdd.userErrors;
      return NextResponse.json(
        {
          error: `Cart error: ${errors[0]?.message || "Unknown error"}`,
        },
        { status: 400 }
      );
    }

    const cart = result.data.cartLinesAdd.cart;

    // Append locale to checkout URL if provided
    let checkoutUrl = cart.checkoutUrl;
    if (locale && (locale === "he" || locale === "en")) {
      const url = new URL(checkoutUrl);
      url.searchParams.set("locale", locale);
      checkoutUrl = url.toString();
    }

    return NextResponse.json({
      cart: {
        id: cart.id,
        checkoutUrl: checkoutUrl,
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.cost?.totalAmount?.amount,
        currencyCode: cart.cost?.totalAmount?.currencyCode,
        items:
          cart.lines?.edges?.map((e: any) => ({
            id: e.node.id,
            lineId: e.node.id,
            quantity: e.node.quantity,
            title:
              e.node.merchandise?.product?.title ||
              e.node.merchandise?.title ||
              "Gift Card",
            isGiftCard: true,
            giftCardAmount: giftCardAmount,
            imageUrls: [],
          })) || [],
      },
    });
  } catch (error: any) {
    console.error("Add gift card to cart error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
