import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cartId,
      imageUrls,
      quantity = 1,
      bookId,
      phoneNumber,
      style,
      locale,
    } = body as {
      cartId: string;
      imageUrls: string[];
      quantity?: number;
      bookId?: string;
      phoneNumber?: string;
      style?: "cartoon" | "pencil" | "watercolor";
      locale?: string;
    };

    console.log(
      "🛒 API /cart/add received style:",
      style,
      "type:",
      typeof style
    );

    if (!cartId || !imageUrls || imageUrls.length !== 5) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    let productVariantId = process.env.SHOPIFY_PRODUCT_VARIANT_ID;

    if (!storeDomain || !accessToken || !productVariantId) {
      return NextResponse.json(
        { error: "Shopify credentials not configured" },
        { status: 500 }
      );
    }

    // Ensure variant ID is in GraphQL format
    if (!productVariantId.startsWith("gid://shopify/ProductVariant/")) {
      if (/^\d+$/.test(productVariantId)) {
        productVariantId = `gid://shopify/ProductVariant/${productVariantId}`;
      }
    }

    // Validate image URLs
    const urls = imageUrls as string[];
    const invalidUrls = urls.filter(
      (url: string) => !url.startsWith("http://") && !url.startsWith("https://")
    );

    if (invalidUrls.length > 0) {
      return NextResponse.json(
        {
          error:
            "Invalid image URLs. Images should be uploaded to Cloudinary first.",
        },
        { status: 400 }
      );
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
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  attributes { key value }
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

    // Store images as cart-level attributes (not line-item attributes) to avoid showing on checkout
    // First, add the line item without image attributes
    // Generate a unique id to prevent Shopify from merging identical lines
    const lineUid = Math.random().toString(36).slice(2);

    const variables = {
      cartId: cartId,
      lines: [
        {
          merchandiseId: productVariantId,
          quantity: quantity,
          attributes: [
            // Ensure this line stays distinct (prevents quantity merge)
            { key: "_uid", value: lineUid },
            // Line item attributes with underscore prefix are hidden from checkout
            { key: "_image_1", value: urls[0] },
            { key: "_image_2", value: urls[1] },
            { key: "_image_3", value: urls[2] },
            { key: "_image_4", value: urls[3] },
            { key: "_image_5", value: urls[4] },
            // Always include style attribute (default to "cartoon" if not provided)
            // Ensure style is valid before saving
            ...(style && (style === "cartoon" || style === "pencil" || style === "watercolor")
              ? [
                  {
                    key: "_style",
                    value: style,
                  },
                  {
                    key: "style",
                    value: style,
                  },
                ]
              : [
                  {
                    key: "_style",
                    value: "cartoon",
                  },
                  {
                    key: "style",
                    value: "cartoon",
                  },
                ]),
            ...(bookId
              ? [
                  {
                    key: "book_id",
                    value: bookId,
                  },
                ]
              : []),
            ...(phoneNumber
              ? [
                  {
                    key: "customer_phone",
                    value: phoneNumber,
                  },
                ]
              : []),
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

    if (!cart || !cart.id) {
      return NextResponse.json(
        { error: "Failed to add item to cart" },
        { status: 500 }
      );
    }

    // Store images separately using the exact line matched by _uid
    const addedLine = cart.lines?.edges
      ?.map((e: any) => e.node)
      .find(
        (n: any) =>
          Array.isArray(n.attributes) &&
          n.attributes.some((a: any) => a.key === "_uid" && a.value === lineUid)
      );
    const lineId = addedLine?.id;

    // Validate and normalize style (use this throughout the function)
    const styleToStore =
      style && (style === "cartoon" || style === "pencil") ? style : "cartoon";

    if (lineId) {
      try {
        // Images are now stored as line item attributes (_image_1..._image_5) which are hidden from checkout
        // Also store in our server-side storage for UI
        console.log(
          "💾 Storing cart images for lineId:",
          lineId,
          "style:",
          styleToStore,
          "original style param:",
          style
        );
        const storeResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/api/cart-images`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cartId: cart.id,
              lineId: lineId,
              imageUrls: urls,
              style: styleToStore,
            }),
          }
        );
        if (!storeResponse.ok) {
          console.error(
            "Failed to store cart images:",
            await storeResponse.text()
          );
        } else {
          console.log("Successfully stored cart images for lineId:", lineId);
        }
      } catch (error) {
        console.error("Error storing cart images:", error);
        // Continue even if image storage fails
      }
    } else {
      console.error("No lineId found after adding item to cart");
    }

    // Return cart with all line items - we'll need to fetch images for existing lines
    // but include images for the newly added line immediately
    const cartItems =
      cart.lines?.edges?.map((e: any) => {
        const node = e.node;
        const isNewLine =
          Array.isArray(node.attributes) &&
          node.attributes.some(
            (a: any) => a.key === "_uid" && a.value === lineUid
          );

        // Extract style from attributes (check both "style" and "_style")
        let itemStyle: "cartoon" | "pencil" | undefined = undefined;
        if (Array.isArray(node.attributes)) {
          const styleAttr = node.attributes.find(
            (a: any) => a.key === "style" || a.key === "_style"
          );
          if (
            styleAttr &&
            (styleAttr.value === "cartoon" || styleAttr.value === "pencil")
          ) {
            itemStyle = styleAttr.value;
          }
        }

        return {
          id: node.id,
          lineId: node.id,
          quantity: node.quantity,
          title:
            node.merchandise?.product?.title ||
            node.merchandise?.title ||
            "ספר מותאם אישית",
          imageUrls: isNewLine ? urls : [], // Include images for the newly added line
          style:
            itemStyle || (isNewLine ? styleToStore || "cartoon" : undefined), // Include style for new line
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
        items: cartItems,
      },
    });
  } catch (error: any) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
