export function isAiPreviewEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_PREVIEW_ENABLED === "true";
}

export function isFramedArtEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FRAMED_ART_ENABLED === "true";
}
