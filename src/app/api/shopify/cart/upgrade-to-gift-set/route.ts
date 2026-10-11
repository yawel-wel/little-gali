import { reportError } from "@/lib/report-error";
import { NextRequest, NextResponse } from "next/server";
import {
  BookUpsellError,
  upgradeBookLineToGiftSet,
} from "@/lib/shopify/book-upsells";

export const runtime = "nodejs";

/** Cart upsell: soft book line → gift set with the blanket matching the book color. */
export async function POST(request: NextRequest) {
  try {
    const { cartId, lineId } = (await request.json()) as {
      cartId?: string;
      lineId?: string;
    };
    if (!cartId || !lineId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const cart = await upgradeBookLineToGiftSet(cartId, lineId);
    return NextResponse.json({ cart: { id: cart.id } });
  } catch (error: unknown) {
    if (error instanceof BookUpsellError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    reportError("Upgrade book to gift set failed", error, { area: "cart" });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
