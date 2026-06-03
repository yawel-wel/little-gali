import type { FramedArtStyleCandidate } from "./types";

export function framedArtMockupImageUrl(
  candidate: FramedArtStyleCandidate | undefined,
): string | undefined {
  if (!candidate) {
    return undefined;
  }
  return candidate.croppedPreviewUrl ?? candidate.previewUrl;
}

export function framedArtCropEditorImageUrl(
  candidate: FramedArtStyleCandidate | undefined,
): string | undefined {
  return candidate?.previewUrl;
}

export function framedArtCropExportImageUrl(
  candidate: FramedArtStyleCandidate | undefined,
): string | undefined {
  return candidate?.cleanUrl;
}
