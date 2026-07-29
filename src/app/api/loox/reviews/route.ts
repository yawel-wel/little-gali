import { NextResponse } from "next/server";
import { fetchLooxProductReviews } from "@/lib/loox/fetch-product-reviews";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  try {
    const reviews = await fetchLooxProductReviews();

    return NextResponse.json(
      { reviews },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch Loox reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", reviews: [] },
      { status: 500 },
    );
  }
}
