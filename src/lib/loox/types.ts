export interface LooxStorefrontReview {
  id: string;
  rating: number;
  body: string;
  date: string;
  reviewer: {
    name: string;
  };
  product?: {
    id: string;
    name?: string;
    url?: string;
    imageUrl?: string;
  };
  media?: Array<{
    type: string;
    url: string;
  }>;
}

export interface LooxStorefrontReviewsResponse {
  reviews: LooxStorefrontReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    nextPageUrl?: string | null;
  };
}

export interface Testimonial {
  id: string;
  rating: number;
  text: string;
  name: string;
  imageUrl?: string;
}

/** A review card on the home page (from Loox's widget feed, see fetch-widget-reviews.ts). */
export interface HomeReview {
  id: string;
  rating: number;
  text: string;
  name: string;
  verified: boolean;
  /** The AI-picked sentence. Usually found inside `text`, but spacing can differ. */
  highlight?: string;
  imageUrl?: string;
  imageAlt?: string;
}
