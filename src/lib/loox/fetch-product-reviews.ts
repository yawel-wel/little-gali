import type {
  LooxStorefrontReview,
  LooxStorefrontReviewsResponse,
  Testimonial,
} from "./types";

const LOOX_STOREFRONT_API = "https://storefront-api.loox.io/storefront/v1";

function toTestimonial(review: LooxStorefrontReview): Testimonial {
  const imageUrl = review.media?.find((item) => item.type === "image")?.url;

  return {
    id: review.id,
    rating: review.rating,
    text: review.body,
    name: review.reviewer.name,
    imageUrl,
  };
}

export async function fetchLooxProductReviews(options?: {
  productId?: string;
  limit?: number;
}): Promise<Testimonial[]> {
  const publicStoreId = process.env.LOOX_PUBLIC_STORE_ID;
  const productId = options?.productId ?? process.env.LOOX_PRODUCT_ID;
  const limit = options?.limit ?? 50;

  if (!publicStoreId) {
    throw new Error("LOOX_PUBLIC_STORE_ID is not configured");
  }

  const reviews: LooxStorefrontReview[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (productId) {
      params.set("productId", productId);
    }

    const response = await fetch(
      `${LOOX_STOREFRONT_API}/store/${publicStoreId}/product-reviews?${params.toString()}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      throw new Error(`Loox API error: ${response.status}`);
    }

    const data = (await response.json()) as LooxStorefrontReviewsResponse;
    reviews.push(...data.reviews);
    hasMore = data.pagination.hasMore;
    page += 1;
  }

  // Loox's productId query can still return reviews for other products
  // (e.g. framed art mixed into soft-book results). Filter strictly.
  const productReviews = productId
    ? reviews.filter((review) => review.product?.id === productId)
    : reviews;

  return productReviews.map(toTestimonial);
}
