export interface LooxStorefrontReview {
  id: string;
  rating: number;
  body: string;
  date: string;
  reviewer: {
    name: string;
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
