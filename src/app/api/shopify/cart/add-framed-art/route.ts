import { NextRequest, NextResponse } from "next/server";
import type { StyleType } from "@/components/style-selector";
import { assertFramedArtEnabled, requireFramedArtSession } from "@/lib/framed-art/auth";
import {
  framedArtShopifyLineAttributes,
  resolveFramedArtFulfillment,
} from "@/lib/framed-art/fulfillment";
import { saveFramedArtSession } from "@/lib/framed-art/store";
import { saveCartImages } from "@/lib/cart-images-store";
import { nudgeShopifyCartDiscounts } from "@/lib/shopify/nudge-cart-discounts";

export const runtime = "nodejs";

function resolveVariantId(): string | null {
  let productVariantId =
    process.env.SHOPIFY_FRAMED_ART_VARIANT_ID?.trim() ||
    "43836272607335";

  if (!productVariantId.startsWith("gid://shopify/ProductVariant/")) {
    if (/^\d+$/.test(productVariantId)) {
      productVariantId = `gid://shopify/ProductVariant/${productVariantId}`;
    }
  }
  return productVariantId;
}

function parseLineAttributes(
  attributes: Array<{ key: string; value: string }> | undefined,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const attr of attributes ?? []) {
    map[attr.key] = attr.value;
  }
  return map;
}

function mapCartLines(cart: {
  lines?: { edges?: Array<{ node: unknown }> };
  checkoutUrl: string;
  id: string;
  totalQuantity: number;
  cost?: { totalAmount?: { amount?: string; currencyCode?: string } };
}) {
  return (
    cart.lines?.edges?.map((edge) => {
      const node = edge.node as {
        id: string;
        quantity: number;
        attributes?: Array<{ key: string; value: string }>;
        merchandise?: { product?: { title?: string }; title?: string };
      };
      const attrs = parseLineAttributes(node.attributes);
      const isFramedArt = attrs._product_type === "framed_art";
      const isGiftCard = attrs._type === "gift_card";
      const styleAttr = attrs._style || attrs.style;
      const style =
        styleAttr === "cartoon" ||
        styleAttr === "pencil" ||
        styleAttr === "watercolor"
          ? styleAttr
          : undefined;

      return {
        id: node.id,
        lineId: node.id,
        quantity: node.quantity,
        title:
          node.merchandise?.product?.title ||
          node.merchandise?.title ||
          (isFramedArt ? "איור ממוסגר" : "Product"),
        imageUrls: isFramedArt && attrs._image ? [attrs._image] : [],
        style,
        isGiftCard,
        isFramedArt,
        framedImageUrl: isFramedArt ? attrs._image : undefined,
        giftCardAmount: isGiftCard
          ? parseFloat(attrs._gift_card_amount || "0") || undefined
          : undefined,
      };
    }) ?? []
  );
}

export async function POST(request: NextRequest) {
  const disabled = assertFramedArtEnabled();
  if (disabled) return disabled;

  try {
    const body = await request.json();
    const {
      cartId,
      sessionId,
      style,
      locale,
    } = body as {
      cartId?: string;
      sessionId: string;
      style?: StyleType;
      locale?: string;
    };

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    const auth = await requireFramedArtSession(sessionId);
    if (auth instanceof NextResponse) return auth;

    const session = auth.session;
    const selectedStyle = style ?? session.selectedStyle;
    if (
      !selectedStyle ||
      !["cartoon", "pencil", "watercolor"].includes(selectedStyle)
    ) {
      return NextResponse.json({ error: "Style is required" }, { status: 400 });
    }

    const fulfillmentResult = resolveFramedArtFulfillment(
      session,
      sessionId,
      selectedStyle,
    );
    if (!fulfillmentResult.ok) {
      return NextResponse.json(
        { error: fulfillmentResult.error },
        { status: 409 },
      );
    }
    const fulfillment = fulfillmentResult.data;

    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    const productVariantId = resolveVariantId();

    if (!storeDomain || !accessToken || !productVariantId) {
      return NextResponse.json(
        { error: "Shopify credentials not configured" },
        { status: 500 },
      );
    }

    const lineUid = Math.random().toString(36).slice(2);
    const lineAttributes = framedArtShopifyLineAttributes(fulfillment, lineUid);

    const linesQuery = `
      lines(first: 20) {
        edges {
          node {
            id
            quantity
            attributes { key value }
            merchandise {
              ... on ProductVariant {
                id
                title
                product { title }
              }
            }
          }
        }
      }
    `;

    if (!cartId) {
      const cartCreateMutation = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
              totalQuantity
              cost { totalAmount { amount currencyCode } }
              ${linesQuery}
            }
            userErrors { code field message }
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
            variables: {
              input: {
                lines: [
                  {
                    merchandiseId: productVariantId,
                    quantity: 1,
                    attributes: lineAttributes,
                  },
                ],
              },
            },
          }),
        },
      );

      const result = await response.json();
      if (result.errors?.length) {
        return NextResponse.json(
          { error: result.errors[0]?.message || "Shopify API error" },
          { status: 500 },
        );
      }
      if (result.data?.cartCreate?.userErrors?.length) {
        return NextResponse.json(
          { error: result.data.cartCreate.userErrors[0]?.message },
          { status: 400 },
        );
      }

      const cart = result.data.cartCreate.cart;
      const addedLine = cart.lines.edges
        .map((e: { node: { attributes?: Array<{ key: string; value: string }>; id: string } }) => e.node)
        .find((n: { attributes?: Array<{ key: string; value: string }> }) =>
          n.attributes?.some((a) => a.key === "_uid" && a.value === lineUid),
        );

      if (addedLine?.id) {
        await saveCartImages(cart.id, addedLine.id, {
          productType: "framed_art",
          framedImageUrl: fulfillment.printImageUrl,
          imageUrls: [fulfillment.printImageUrl],
          originalUrls: [fulfillment.originalImageUrl],
          previewSessionId: fulfillment.sessionId,
          style: fulfillment.style,
        });
      }

      session.phase = "cart_added";
      session.selectedStyle = selectedStyle;
      await saveFramedArtSession(session);

      let checkoutUrl = cart.checkoutUrl as string;
      if (locale === "he" || locale === "en") {
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
          items: mapCartLines(cart),
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
            cost { totalAmount { amount currencyCode } }
            ${linesQuery}
          }
          userErrors { code field message }
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
          variables: {
            cartId,
            lines: [
              {
                merchandiseId: productVariantId,
                quantity: 1,
                attributes: lineAttributes,
              },
            ],
          },
        }),
      },
    );

    const result = await response.json();
    if (result.errors?.length) {
      return NextResponse.json(
        { error: result.errors[0]?.message || "Shopify API error" },
        { status: 500 },
      );
    }
    if (result.data?.cartLinesAdd?.userErrors?.length) {
      return NextResponse.json(
        { error: result.data.cartLinesAdd.userErrors[0]?.message },
        { status: 400 },
      );
    }

    let cart = result.data.cartLinesAdd.cart;

    if ((cart.totalQuantity ?? 0) >= 2) {
      await nudgeShopifyCartDiscounts(cart.id);
      const refreshRes = await fetch(
        `https://${storeDomain}/api/2024-01/graphql.json`,
        {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": accessToken,
          },
          body: JSON.stringify({
            query: `
              query refreshCart($id: ID!) {
                cart(id: $id) {
                  id
                  checkoutUrl
                  totalQuantity
                  cost { totalAmount { amount currencyCode } }
                  ${linesQuery}
                }
              }
            `,
            variables: { id: cart.id },
          }),
        },
      );
      const refreshJson = await refreshRes.json();
      if (refreshJson.data?.cart) {
        cart = refreshJson.data.cart;
      }
    }

    const addedLine = cart.lines.edges
      .map((e: { node: { attributes?: Array<{ key: string; value: string }>; id: string } }) => e.node)
      .find((n: { attributes?: Array<{ key: string; value: string }> }) =>
        n.attributes?.some((a) => a.key === "_uid" && a.value === lineUid),
      );

    if (addedLine?.id) {
      await saveCartImages(cart.id, addedLine.id, {
        productType: "framed_art",
        framedImageUrl: fulfillment.printImageUrl,
        imageUrls: [fulfillment.printImageUrl],
        originalUrls: [fulfillment.originalImageUrl],
        previewSessionId: fulfillment.sessionId,
        style: fulfillment.style,
      });
    }

    session.phase = "cart_added";
    session.selectedStyle = selectedStyle;
    await saveFramedArtSession(session);

    let checkoutUrl = cart.checkoutUrl as string;
    if (locale === "he" || locale === "en") {
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
        items: mapCartLines(cart),
      },
    });
  } catch (error: unknown) {
    console.error("Add framed art to cart error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
