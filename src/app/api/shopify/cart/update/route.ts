import { NextRequest, NextResponse } from "next/server";
import { nudgeShopifyCartDiscounts } from "@/lib/shopify/nudge-cart-discounts";
import { updateCartLineQuantity } from "@/lib/shopify/update-cart-line-quantity";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, lineId, quantity, locale } = body as {
      cartId: string;
      lineId: string;
      quantity: number;
      locale?: string;
    };

    if (!cartId || !lineId || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: "Quantity cannot be negative" },
        { status: 400 },
      );
    }

    const { cart } = await updateCartLineQuantity(cartId, lineId, quantity);

    await nudgeShopifyCartDiscounts(cart.id);

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
        totalAmount: cart.totalAmount,
        currencyCode: cart.currencyCode,
        lineCount: cart.lines.length,
      },
    });
  } catch (error: unknown) {
    console.error("Update cart error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Cart line not found" ||
      message.includes("Quantity update did not apply") ||
      message.includes("extra cart line") ||
      message.includes("duplicate cart lines")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
