import { NextRequest, NextResponse } from "next/server";
import {
  deleteCartImages,
  loadCartImages,
  saveCartImages,
  type StoredCartImages,
} from "@/lib/cart-images-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, lineId, imageUrls, style, originalUrls, generatedBwUrls, previewSessionId } =
      body as {
        cartId: string;
        lineId?: string;
        imageUrls: string[];
        style?: StoredCartImages["style"];
        originalUrls?: string[];
        generatedBwUrls?: string[];
        previewSessionId?: string;
      };

    if (!cartId || !imageUrls || imageUrls.length !== 5) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const key = lineId || "default";
    await saveCartImages(cartId, key, {
      imageUrls,
      style: style || "cartoon",
      originalUrls,
      generatedBwUrls,
      previewSessionId,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Store cart images error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cartId");
    const lineId = searchParams.get("lineId");

    if (!cartId) {
      return NextResponse.json({ error: "Cart ID is required" }, { status: 400 });
    }

    if (lineId) {
      await deleteCartImages(cartId, lineId);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Delete cart images error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cartId");
    const lineId = searchParams.get("lineId");

    if (!cartId) {
      return NextResponse.json({ error: "Cart ID is required" }, { status: 400 });
    }

    if (!lineId) {
      return NextResponse.json({ imageUrls: [] });
    }

    const lineData = await loadCartImages(cartId, lineId);
    if (!lineData) {
      return NextResponse.json({ imageUrls: [] });
    }

    return NextResponse.json(lineData);
  } catch (error: unknown) {
    console.error("Get cart images error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
