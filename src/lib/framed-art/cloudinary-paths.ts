import type { StyleType } from "@/components/style-selector";

export function framedArtColorOutputPublicId(
  sessionId: string,
  style: StyleType,
  version: number,
): string {
  return `framed-art/${sessionId}/color/${style}/v${version}`;
}

export function framedArtColorWatermarkedPublicId(
  sessionId: string,
  style: StyleType,
  version: number,
): string {
  return `${framedArtColorOutputPublicId(sessionId, style, version)}_wm`;
}
