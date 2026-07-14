import { NextRequest, NextResponse } from "next/server";
import {
  bookColorFromVariantId,
  isValidBookColor,
  resolveBookVariantGid,
  type BookColor,
} from "@/lib/book-color";
import {
  bookFlowShopifyAttributes,
  formatSelectedGenerationBySlot,
  generatedColorUrlsShopifyAttributes,
  hasInvalidHttpImageUrls,
  isValidBookCartImageCount,
  isValidBookCartStyle,
  originalUrlsShopifyAttributes,
  primaryImageUrlsShopifyAttributes,
  type PreviewGenerationStats,
  previewStatsShopifyAttributes,
} from "@/lib/preview-session/generation-stats";
import { parseBookFlow, type BookFlow } from "@/lib/preview-session/book-flow";
import { resolveMixpanelDistinctIdForCart } from "@/lib/analytics-purchase";

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
      originalUrls,
      generatedBwUrls,
      generatedColorUrls,
      previewSessionId,
      generationStats,
      bookColor,
      bookFlow: bookFlowRaw,
      mixpanelDistinctId,
    } = body as {
      imageUrls: string[];
      quantity?: number;
      bookId?: string;
      phoneNumber?: string;
      style?: "cartoon" | "pencil" | "watercolor" | "colorful";
      bookColor?: BookColor;
      bookFlow?: BookFlow;
      locale?: string;
      originalUrls?: string[];
      generatedBwUrls?: string[];
      generatedColorUrls?: string[];
      previewSessionId?: string;
      generationStats?: PreviewGenerationStats;
      mixpanelDistinctId?: string;
    };

    if (!imageUrls || !isValidBookCartImageCount(imageUrls.length)) {
      return NextResponse.json(
        { error: "Missing required fields or invalid image count" },
        { status: 400 }
      );
    }

    const bookFlow = parseBookFlow(
      bookFlowRaw ?? (imageUrls.length === 9 ? "colorful" : "classic"),
    );

    const resolvedMixpanelDistinctId = await resolveMixpanelDistinctIdForCart({
      mixpanelDistinctId,
      previewSessionId,
    });

    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    if (!storeDomain || !accessToken) {
      return NextResponse.json(
        { error: "Shopify credentials not configured" },
        { status: 500 }
      );
    }

    const productVariantId = resolveBookVariantGid(
      isValidBookColor(bookColor) ? bookColor : undefined,
    );

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

    if (generatedColorUrls) {
      if (!isValidBookCartImageCount(generatedColorUrls.length)) {
        return NextResponse.json(
          { error: "Invalid color image count" },
          { status: 400 },
        );
      }
      if (hasInvalidHttpImageUrls(generatedColorUrls)) {
        return NextResponse.json(
          {
            error:
              "Invalid color image URLs. Images should be uploaded to Cloudinary first.",
          },
          { status: 400 },
        );
      }
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
              ...bookFlowShopifyAttributes(bookFlow),
              // Line item attributes with underscore prefix are hidden from checkout
              ...primaryImageUrlsShopifyAttributes(urls),
              // Always include style attribute (default to "cartoon" if not provided)
              ...(isValidBookCartStyle(style)
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
              ...previewStatsShopifyAttributes(
                previewSessionId,
                generationStats,
                resolvedMixpanelDistinctId,
              ),
              ...originalUrlsShopifyAttributes(originalUrls),
              ...generatedColorUrlsShopifyAttributes(generatedColorUrls),
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
          // Do NOT set image_1...image_N here - they will be set as namespaced attributes after we get the lineId
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
    const styleToStore = isValidBookCartStyle(style) ? style : "cartoon";

    if (lineId) {
      try {
        // Images are now stored as line item attributes (_image_N) which are hidden from checkout
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
              originalUrls,
              generatedBwUrls,
              generatedColorUrls,
              previewSessionId,
              previewGenTotal: generationStats?.totalGenerations,
              previewGenSelected: generationStats
                ? formatSelectedGenerationBySlot(
                    generationStats.selectedGenerationBySlot,
                  )
                : undefined,
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
        let itemStyle:
          | "cartoon"
          | "pencil"
          | "watercolor"
          | "colorful"
          | undefined = undefined;
        if (Array.isArray(node.attributes)) {
          const styleAttr = node.attributes.find(
            (a: any) => a.key === "style" || a.key === "_style"
          );
          if (styleAttr && isValidBookCartStyle(styleAttr.value)) {
            itemStyle = styleAttr.value;
          }
        }

        const variantId = node.merchandise?.id;
        const itemBookColor = bookColorFromVariantId(variantId);

        return {
          id: node.id,
          lineId: node.id,
          quantity: node.quantity,
          title:
            node.merchandise?.product?.title ||
            node.merchandise?.title ||
            "ספר מותאם אישית",
          imageUrls: isNewLine ? urls : [], // Include images for the newly created line
          style:
            itemStyle || (isNewLine ? styleToStore || "cartoon" : undefined), // Include style for new line
          variantId: variantId ?? undefined,
          bookColor: itemBookColor ?? undefined,
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
