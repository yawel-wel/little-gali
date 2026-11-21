export function isAiPreviewEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_PREVIEW_ENABLED === "true";
}

export function isFramedArtEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FRAMED_ART_ENABLED === "true";
}

/**
 * Loading-screen photos turn on a 3D ring instead of the "breathe" row.
 * On by default; set NEXT_PUBLIC_PREVIEW_LOADING_ORBIT=false to go back.
 */
export function isPreviewLoadingOrbitEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PREVIEW_LOADING_ORBIT !== "false";
}

/** When true, preview uses a single colorful style (`pens`) instead of pencil+watercolor. */
export function isPreviewSingleColorStyleEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PREVIEW_SINGLE_COLOR_STYLE === "true";
}

/**
 * Home page: the moving review-cards section (2nd section) replaces "book in use"
 * and the Loox carousel further down. On by default; set
 * NEXT_PUBLIC_HOME_REVIEWS_MARQUEE=false to go back.
 */
export function isHomeReviewsMarqueeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HOME_REVIEWS_MARQUEE !== "false";
}

/**
 * Home reviews row layout. On: photo reviews alternate with pairs of half-height
 * text reviews, with a book-in-use photo every 2–3 tiles. Set
 * NEXT_PUBLIC_HOME_REVIEWS_MIXED=false for the reviews-only row.
 */
export function isHomeReviewsMixedEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HOME_REVIEWS_MIXED !== "false";
}
