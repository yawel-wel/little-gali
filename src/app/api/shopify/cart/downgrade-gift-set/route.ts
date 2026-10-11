import { reportError } from "@/lib/report-error";
import { NextRequest, NextResponse } from "next/server";
import {
  BookUpsellError,
  downgradeGiftSetToBook,
} from "@/lib/shopify/book-upsells";

export const runtime = "nodejs";

/** Cart: gift set line → plain soft book (customer removed the blanket). */
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

    const cart = await downgradeGiftSetToBook(cartId, lineId);
    return NextResponse.json({ cart: { id: cart.id } });
  } catch (error: unknown) {
    if (error instanceof BookUpsellError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    reportError("Downgrade gift set to book failed", error, { area: "cart" });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
