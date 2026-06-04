import { NextRequest, NextResponse } from "next/server";
import {
  extractImagesFromLineAttributes,
  representativeLineIdsForImageLoad,
} from "@/lib/cart-line-images";
import { loadCartImagesBatch } from "@/lib/cart-images-store";
import { CART_LINE_COST_FIELDS } from "@/lib/shopify/cart-line-cost";
import { SHOPIFY_CART_LINES_FIRST } from "@/lib/shopify/cart-lines-limit";
import { getLineGroupId } from "@/lib/shopify/cart-line-group";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, locale } = body as { cartId: string; locale?: string };

    if (!cartId) {
      return NextResponse.json(
        { error: "Cart ID is required" },
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

    const cartQuery = `
      query getCart($id: ID!) {
        cart(id: $id) {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: ${SHOPIFY_CART_LINES_FIRST}) {
            edges {
              node {
                id
                quantity
                ${CART_LINE_COST_FIELDS}
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                    }
                  }
                }
                attributes {
                  key
                  value
                }
              }
            }
          }
          attributes {
            key
            value
          }
        }
      }
    `;

    const fetchCartFromShopify = async () => {
      const response = await fetch(
        `https://${storeDomain}/api/2024-01/graphql.json`,
        {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": accessToken,
          },
          body: JSON.stringify({
            query: cartQuery,
            variables: { id: cartId },
          }),
        },
      );
      return response.json();
    };

    let result = await fetchCartFromShopify();

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

    if (!result.data?.cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cart = result.data.cart;
    const cartAttributes = cart.attributes || [];

    type RawCartLine = {
      id: string;
      quantity: number;
      title?: string;
      imageUrls: string[];
      attributes?: Array<{ key: string; value: string }>;
      cost?: unknown;
    };

    const rawLines: RawCartLine[] =
      cart.lines?.edges?.map((edge: { node: Record<string, unknown> }) => {
        const node = edge.node as {
          id: string;
          quantity: number;
          attributes?: Array<{ key: string; value: string }>;
          merchandise?: { product?: { title?: string }; title?: string };
          cost?: unknown;
        };
        const { imageUrls } = extractImagesFromLineAttributes(
          node.attributes,
          cartAttributes,
        );

        return {
          id: node.id,
          quantity: node.quantity,
          title: node.merchandise?.product?.title || node.merchandise?.title,
          imageUrls,
          attributes: node.attributes,
          cost: node.cost,
        };
      }) ?? [];

    const repLineIds = representativeLineIdsForImageLoad(rawLines);
    const storedByRepId = await loadCartImagesBatch(cartId, repLineIds);

    const groupToRepId = new Map<string, string>();
    for (const repId of repLineIds) {
      const repLine = rawLines.find((l) => l.id === repId);
      const groupId =
        getLineGroupId({
          id: repId,
          quantity: 1,
          attributes: repLine?.attributes,
        }) ?? repId;
      groupToRepId.set(groupId, repId);
    }

    const storedImagesByLineId: Record<
      string,
      (typeof storedByRepId)[string]
    > = {};
    for (const line of rawLines) {
      const groupId =
        getLineGroupId({
          id: line.id,
          quantity: line.quantity,
          attributes: line.attributes,
        }) ?? line.id;
      const repId = groupToRepId.get(groupId) ?? line.id;
      const stored = storedByRepId[repId] ?? null;
      if (stored) {
        storedImagesByLineId[line.id] = stored;
      }
    }

    const lines = rawLines.map((line) => ({
      ...line,
      storedImages: storedImagesByLineId[line.id] ?? null,
    }));

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
        lines: lines,
        attributes: cart.attributes || [],
      },
    });
  } catch (error: any) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
