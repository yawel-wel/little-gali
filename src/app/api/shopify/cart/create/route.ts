import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      imageUrls,
      quantity = 1,
      bookId,
      phoneNumber,
      style,
      locale,
    } = body as {
      imageUrls: string[];
      quantity?: number;
      bookId?: string;
      phoneNumber?: string;
      style?: "cartoon" | "pencil";
      locale?: string;
    };

    if (!imageUrls || imageUrls.length !== 5) {
      return NextResponse.json(
        { error: "Missing required fields or invalid image count" },
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
      } else {
        return NextResponse.json(
          {
            error:
              "Invalid SHOPIFY_PRODUCT_VARIANT_ID format. Use either 'gid://shopify/ProductVariant/XXXXX' or just the numeric ID 'XXXXX'",
          },
          { status: 500 }
        );
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

    // Generate a unique id to prevent Shopify from merging identical lines
    const lineUid = Math.random().toString(36).slice(2);

    const variables = {
      input: {
        lines: [
          {
            merchandiseId: productVariantId,
            quantity: quantity,
            // Ensure this line stays distinct (prevents quantity merge)
            attributes: [
              { key: "_uid", value: lineUid },
              // Line item attributes with underscore prefix are hidden from checkout
              { key: "_image_1", value: urls[0] },
              { key: "_image_2", value: urls[1] },
              { key: "_image_3", value: urls[2] },
              { key: "_image_4", value: urls[3] },
              { key: "_image_5", value: urls[4] },
              // Always include style attribute (default to "cartoon" if not provided)
              {
                key: "_style",
                value: style || "cartoon",
              },
              {
                key: "style",
                value: style || "cartoon",
              },
            ],
          },
        ],
        attributes: [
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
          // Do NOT set image_1...image_5 here - they will be set as namespaced attributes after we get the lineId
        ],
        note: `ספר מותאם אישית${bookId ? ` - ${bookId}` : ""}`,
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

    if (!cart || !cart.id) {
      return NextResponse.json(
        { error: "Failed to create cart" },
        { status: 500 }
      );
    }

    // Store images separately keyed by the correct line via _uid attribute
    const createdLine = cart.lines?.edges
      ?.map((e: any) => e.node)
      .find(
        (n: any) =>
          Array.isArray(n.attributes) &&
          n.attributes.some((a: any) => a.key === "_uid" && a.value === lineUid)
      );
    const lineId = createdLine?.id;
    
    // Validate and normalize style (use this throughout the function)
    const styleToStore = style && (style === "cartoon" || style === "pencil") ? style : "cartoon";
    
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
      console.error("No lineId found after creating cart");
    }

    // Return cart with line items including images for immediate use
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
          if (styleAttr && (styleAttr.value === "cartoon" || styleAttr.value === "pencil")) {
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
          imageUrls: isNewLine ? urls : [], // Include images for the newly created line
          style: itemStyle || (isNewLine ? (styleToStore || "cartoon") : undefined), // Include style for new line
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
    console.error("Cart creation error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
