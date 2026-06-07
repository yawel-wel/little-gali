import type { StyleType } from "@/components/style-selector";

const FRAMED_ART_ROOT = "little-gali/framed-art";

/** Session id in the file name so Cloudinary unsigned uploads stay unique (same as book previews). */
export function framedArtColorOutputPublicId(
  sessionId: string,
  style: StyleType,
  version: number,
): string {
  return `${FRAMED_ART_ROOT}/${sessionId}/outputs/color/${style}/${sessionId}_color_${style}_v${version}`;
}

export function framedArtColorWatermarkedPublicId(
  sessionId: string,
  style: StyleType,
  version: number,
): string {
  return `${FRAMED_ART_ROOT}/${sessionId}/outputs/watermark/color/${style}/${sessionId}_color_${style}_v${version}`;
}

export function framedArtColorCroppedPublicId(
  sessionId: string,
  style: StyleType,
  version: number,
): string {
  return `${framedArtColorOutputPublicId(sessionId, style, version)}_crop`;
}

export function framedArtColorCroppedWatermarkedPublicId(
  sessionId: string,
  style: StyleType,
  version: number,
): string {
  return `${framedArtColorWatermarkedPublicId(sessionId, style, version)}_crop`;
}
