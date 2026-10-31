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
