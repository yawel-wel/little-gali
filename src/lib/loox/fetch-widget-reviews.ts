import type { HomeReview } from "./types";

/**
 * Reviews from the feed Loox's own widgets read. Unlike the official Storefront API
 * (fetch-product-reviews.ts) it carries the AI highlight sentence and the verified mark.
 * It is not a documented API, so everything optional is read defensively: if Loox
 * changes it, cards lose the highlight instead of breaking.
 */
const LOOX_WIDGET_ROOT = "https://loox.io/widget";
const LOOX_CLIENT_ID = process.env.LOOX_WIDGET_CLIENT_ID ?? "55SV5nMc6_";
const DEFAULT_PRODUCT_ID =
  process.env.LOOX_PRODUCT_ID ??
  process.env.NEXT_PUBLIC_LOOX_PRODUCT_ID ??
  "7647868387431";
const PAGE_LIMIT = 50;
const MAX_PAGES = 10;

interface WidgetReview {
  _id?: unknown;
  rating?: unknown;
  review?: unknown;
  nickname?: unknown;
  verified?: unknown;
  highlight?: unknown;
  product?: { id?: unknown } | null;
  media?: Array<{ type?: unknown; image?: unknown; altText?: unknown }> | null;
}

interface WidgetReviewsResponse {
  reviews?: WidgetReview[];
  pagination?: { hasMore?: boolean };
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function absoluteUrl(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

function toHomeReview(review: WidgetReview): HomeReview | null {
  const id = asString(review._id);
  const text = asString(review.review);
  const rating = typeof review.rating === "number" ? review.rating : NaN;
  if (!id || !text || !Number.isFinite(rating)) return null;

  const photo = review.media?.find(
    (item) => item?.type === "photo" && asString(item.image),
  );
  const imageUrl = photo ? asString(photo.image) : undefined;

  return {
    id,
    rating,
    text: text.trim(),
    name: asString(review.nickname) ?? "",
    verified: review.verified === true,
    highlight: asString(review.highlight)?.trim(),
    imageUrl: imageUrl ? absoluteUrl(imageUrl) : undefined,
    imageAlt: photo ? asString(photo.altText) : undefined,
  };
}

/** All reviews of one product, in the store's "featured" order. */
export async function fetchLooxWidgetReviews(options?: {
  productId?: string;
}): Promise<HomeReview[]> {
  const productId = options?.productId ?? DEFAULT_PRODUCT_ID;
  const raw: WidgetReview[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_LIMIT),
      sort: "featured",
    });
    const response = await fetch(
      `${LOOX_WIDGET_ROOT}/${LOOX_CLIENT_ID}/${productId}/reviews-data?${params.toString()}`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) {
      throw new Error(`Loox widget reviews error: ${response.status}`);
    }

    const data = (await response.json()) as WidgetReviewsResponse;
    if (!Array.isArray(data.reviews)) {
      throw new Error("Loox widget reviews: unexpected response shape");
    }
    raw.push(...data.reviews);
    if (!data.pagination?.hasMore) break;
  }

  // Same strict filter as fetch-product-reviews.ts: never show another product's reviews.
  return raw
    .filter((review) => String(review.product?.id ?? "") === productId)
    .map(toHomeReview)
    .filter((review): review is HomeReview => review !== null);
}
