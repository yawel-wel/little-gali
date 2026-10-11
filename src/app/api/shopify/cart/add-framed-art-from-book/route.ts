import { reportError } from "@/lib/report-error";
import { NextRequest, NextResponse } from "next/server";
import { assertFramedArtEnabled } from "@/lib/framed-art/auth";
import {
  BookUpsellError,
  addFramedArtFromBookLine,
} from "@/lib/shopify/book-upsells";

export const runtime = "nodejs";

/** Cart upsell: framed art printed from one color page of a book already in the cart. */
export async function POST(request: NextRequest) {
  const disabled = assertFramedArtEnabled();
  if (disabled) return disabled;

  try {
    const { cartId, lineId, imageIndex } = (await request.json()) as {
      cartId?: string;
      lineId?: string;
      imageIndex?: number;
    };
    if (!cartId || !lineId || typeof imageIndex !== "number") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const cart = await addFramedArtFromBookLine(cartId, lineId, imageIndex);
    return NextResponse.json({ cart: { id: cart.id } });
  } catch (error: unknown) {
    if (error instanceof BookUpsellError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    reportError("Add framed art from book failed", error, { area: "cart" });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
