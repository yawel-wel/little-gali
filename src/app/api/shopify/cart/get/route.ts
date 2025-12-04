import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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

    const response = await fetch(
      `https://${storeDomain}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: cartQuery,
          variables: { id: cartId },
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

    if (!result.data || !result.data.cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cart = result.data.cart;

    // DO NOT extract image URLs from Shopify attributes - they show on checkout
    // Images are now stored separately in /api/cart-images and will be fetched by CartContext
    // For backward compatibility, we still check Shopify attributes as fallback (but won't store new ones there)
    const lines =
      cart.lines?.edges?.map((edge: any) => {
        const node = edge.node;
        const imageUrls: string[] = [];

        // Backward compatibility: check old Shopify attributes (for existing carts)
        // But we no longer store new images in Shopify attributes
        for (let i = 1; i <= 5; i++) {
          const imageAttr = node.attributes?.find(
            (attr: any) =>
              attr.key === `_image_${i}` || attr.key === `image_${i}`
          );
          if (imageAttr?.value) {
            imageUrls.push(imageAttr.value);
          }
        }

        // Also check cart-level attributes for backward compatibility
        if (imageUrls.length === 0) {
          const bookImagesAttr = cart.attributes?.find(
            (attr: any) => attr.key === "_book_images"
          );
          if (bookImagesAttr?.value) {
            try {
              const parsed = JSON.parse(bookImagesAttr.value);
              if (Array.isArray(parsed)) {
                imageUrls.push(...parsed);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }

        // If still no images, check old cart-level format
        if (imageUrls.length === 0) {
          for (let i = 1; i <= 5; i++) {
            const imageAttr = cart.attributes?.find(
              (attr: any) =>
                attr.key === `_image_${i}` || attr.key === `image_${i}`
            );
            if (imageAttr?.value) {
              imageUrls.push(imageAttr.value);
            }
          }
        }

        return {
          id: node.id,
          quantity: node.quantity,
          title: node.merchandise?.product?.title || node.merchandise?.title,
          imageUrls: imageUrls, // Empty for new carts, populated for old carts (backward compatibility)
          attributes: node.attributes, // Include attributes for fallback in CartContext
        };
      }) || [];

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
