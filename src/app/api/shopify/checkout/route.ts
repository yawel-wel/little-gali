import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log("=== Shopify Checkout Function started ===");

  try {
    // Parse request body
    console.log("Parsing request body...");
    const body = await request.json();
    console.log("Request body received:", JSON.stringify(body, null, 2));

    const { imageUrls, quantity = 1, bookId } = body;

    if (!imageUrls || imageUrls.length !== 5) {
      console.error("Invalid request:", {
        imageUrlsLength: imageUrls?.length,
      });
      return NextResponse.json(
        { error: "Missing required fields or invalid image count" },
        { status: 400 }
      );
    }

    console.log("Request validation passed");

    // Get Shopify credentials
    console.log("Getting Shopify credentials...");
    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    let productVariantId = process.env.SHOPIFY_PRODUCT_VARIANT_ID;

    console.log("Store domain:", storeDomain);
    console.log("Access token exists:", !!accessToken);
    console.log("Product variant ID (raw):", productVariantId);

    if (!storeDomain || !accessToken || !productVariantId) {
      console.error("Missing Shopify credentials");
      return NextResponse.json(
        { error: "Shopify credentials not configured" },
        { status: 500 }
      );
    }

    // Ensure variant ID is in GraphQL format (gid://shopify/ProductVariant/XXXXX)
    // If user provided just the numeric ID, convert it
    if (!productVariantId.startsWith("gid://shopify/ProductVariant/")) {
      // If it's just a number, add the prefix
      if (/^\d+$/.test(productVariantId)) {
        productVariantId = `gid://shopify/ProductVariant/${productVariantId}`;
        console.log(
          "Converted variant ID to GraphQL format:",
          productVariantId
        );
      } else {
        console.error("Invalid variant ID format:", productVariantId);
        return NextResponse.json(
          {
            error:
              "Invalid SHOPIFY_PRODUCT_VARIANT_ID format. Use either 'gid://shopify/ProductVariant/XXXXX' or just the numeric ID 'XXXXX'",
          },
          { status: 500 }
        );
      }
    }

    console.log("Product variant ID (final):", productVariantId);

    // Create cart with Shopify Storefront API (new Cart API)
    const cartCreateMutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
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

    // Validate that imageUrls are URLs (not base64)
    // With Cloudinary, we should receive URLs, not base64 data URLs
    const invalidUrls = imageUrls.filter(
      (url: string) => !url.startsWith("http://") && !url.startsWith("https://")
    );

    if (invalidUrls.length > 0) {
      console.error("Invalid image URLs detected:", invalidUrls.length);
      return NextResponse.json(
        {
          error:
            "Invalid image URLs. Images should be uploaded to Cloudinary first.",
        },
        { status: 400 }
      );
    }

    console.log(
      "Image URLs validated - all are HTTP/HTTPS URLs from Cloudinary"
    );

    const variables = {
      input: {
        lines: [
          {
            merchandiseId: productVariantId,
            quantity: quantity,
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
          {
            key: "image_1",
            value: imageUrls[0],
          },
          {
            key: "image_2",
            value: imageUrls[1],
          },
          {
            key: "image_3",
            value: imageUrls[2],
          },
          {
            key: "image_4",
            value: imageUrls[3],
          },
          {
            key: "image_5",
            value: imageUrls[4],
          },
        ],
        note: `ספר מותאם אישית${bookId ? ` - ${bookId}` : ""}

תמונות נשמרו בתכונות העגלה (cart attributes).`,
      },
    };

    console.log("Calling Shopify Cart API...");
    console.log("Variables:", JSON.stringify(variables, null, 2));

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

    console.log("Shopify response status:", response.status);

    const responseText = await response.text();
    console.log("Shopify response text:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log("Shopify response parsed:", JSON.stringify(result, null, 2));
    } catch (e) {
      console.error("Failed to parse Shopify response:", e);
      return NextResponse.json(
        { error: "Invalid response from Shopify" },
        { status: 500 }
      );
    }

    if (result.errors) {
      console.error("Shopify API errors:", result.errors);
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
      console.error("Invalid response structure:", result);
      return NextResponse.json(
        { error: "Invalid response from Shopify" },
        { status: 500 }
      );
    }

    if (result.data.cartCreate.userErrors.length > 0) {
      const errors = result.data.cartCreate.userErrors;
      console.error("Cart creation errors:", errors);
      return NextResponse.json(
        {
          error: `Cart error: ${errors[0]?.message || "Unknown error"}`,
        },
        { status: 400 }
      );
    }

    const cart = result.data.cartCreate.cart;

    if (!cart) {
      console.error(
        "Cart is null - full response:",
        JSON.stringify(result, null, 2)
      );
      return NextResponse.json(
        {
          error: "Failed to create cart. Cart creation returned null.",
        },
        { status: 500 }
      );
    }

    if (!cart.id || !cart.checkoutUrl) {
      console.error(
        "Cart missing required fields:",
        JSON.stringify(cart, null, 2)
      );
      return NextResponse.json(
        {
          error:
            "Cart created but missing required fields (id or checkoutUrl).",
        },
        { status: 500 }
      );
    }

    console.log("Cart created successfully:", cart.id);
    console.log("Checkout URL:", cart.checkoutUrl);

    return NextResponse.json({
      checkoutUrl: cart.checkoutUrl,
      checkoutId: cart.id,
    });
  } catch (error: any) {
    console.error("=== ERROR IN FUNCTION ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
