import { reportError } from "@/lib/report-error";
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
    reportError("Loox reviews fetch failed", error, { area: "loox" });
    return NextResponse.json(
      { error: "Failed to fetch reviews", reviews: [] },
      { status: 500 },
    );
  }
}
