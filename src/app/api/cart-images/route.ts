import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// In-memory storage for cart images (in production, use a database)
// Key: cartId, Value: { [lineId]: imageUrls[] }
const cartImagesStore = new Map<string, { [lineId: string]: string[] }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, lineId, imageUrls } = body as {
      cartId: string;
      lineId?: string;
      imageUrls: string[];
    };

    if (!cartId || !imageUrls || imageUrls.length !== 5) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Store images for this cart/line
    if (!cartImagesStore.has(cartId)) {
      cartImagesStore.set(cartId, {});
    }
    const cartData = cartImagesStore.get(cartId)!;

    // Use lineId if provided, otherwise use a default key
    const key = lineId || "default";
    cartData[key] = imageUrls;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Store cart images error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cartId");
    const lineId = searchParams.get("lineId");

    if (!cartId) {
      return NextResponse.json(
        { error: "Cart ID is required" },
        { status: 400 }
      );
    }

    const cartData = cartImagesStore.get(cartId);
    if (cartData && lineId) {
      delete cartData[lineId];
      // If cart has no more line items, remove the cart entry
      if (Object.keys(cartData).length === 0) {
        cartImagesStore.delete(cartId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete cart images error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cartId");
    const lineId = searchParams.get("lineId");

    if (!cartId) {
      return NextResponse.json(
        { error: "Cart ID is required" },
        { status: 400 }
      );
    }

    const cartData = cartImagesStore.get(cartId);
    if (!cartData) {
      return NextResponse.json({ imageUrls: [] });
    }

    // If lineId provided, return specific line images, otherwise return all
    if (lineId && cartData[lineId]) {
      return NextResponse.json({ imageUrls: cartData[lineId] });
    }

    // Return all images for the cart (for backward compatibility)
    const allImages = Object.values(cartData).flat();
    return NextResponse.json({ imageUrls: allImages });
  } catch (error: any) {
    console.error("Get cart images error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
