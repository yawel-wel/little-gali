import type { StyleType } from "@/components/style-selector";
import { COLORFUL_SLOT_COUNT } from "./book-flow";
import type { PreviewCandidate, PreviewSession } from "./types";

export type PreviewOutputKind = "bw" | "color";

export const PREVIEW_SESSION_ROOT = "little-gali/sessions";

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function slotNumber(slotIndex: number): number {
  if (
    !Number.isInteger(slotIndex) ||
    slotIndex < 0 ||
    slotIndex >= COLORFUL_SLOT_COUNT
  ) {
    throw new Error("Invalid slot index");
  }
  return slotIndex + 1;
}

/** Base file name includes sessionId so Cloudinary search works even when folder is flattened by preset. */
function slotFilePrefix(sessionId: string, slotIndex: number): string {
  return `${sessionId}_slot${slotNumber(slotIndex)}`;
}

export function inputPublicId(sessionId: string, slotIndex: number): string {
  return `${PREVIEW_SESSION_ROOT}/${sessionId}/inputs/${slotFilePrefix(
    sessionId,
    slotIndex,
  )}_original`;
}

export function replacedInputPublicId(
  sessionId: string,
  slotIndex: number,
  version: number,
): string {
  return `${PREVIEW_SESSION_ROOT}/${sessionId}/inputs_replaced/${slotFilePrefix(
    sessionId,
    slotIndex,
  )}_original_v${version}`;
}

export function outputPublicId(
  sessionId: string,
  kind: PreviewOutputKind,
  slotIndex: number,
  version: number,
): string {
  return `${PREVIEW_SESSION_ROOT}/${sessionId}/outputs/${kind}/${slotFilePrefix(
    sessionId,
    slotIndex,
  )}_${kind}_v${version}`;
}

export function watermarkedOutputPublicId(
  sessionId: string,
  kind: PreviewOutputKind,
  slotIndex: number,
  version: number,
): string {
  return `${PREVIEW_SESSION_ROOT}/${sessionId}/outputs/watermark/${kind}/${slotFilePrefix(
    sessionId,
    slotIndex,
  )}_${kind}_v${version}`;
}

export function colorOutputPublicId(
  sessionId: string,
  slotIndex: number,
  style: StyleType,
  version: number,
): string {
  return `${PREVIEW_SESSION_ROOT}/${sessionId}/outputs/color/${style}/${slotFilePrefix(
    sessionId,
    slotIndex,
  )}_color_${style}_v${version}`;
}

export function watermarkedColorOutputPublicId(
  sessionId: string,
  slotIndex: number,
  style: StyleType,
  version: number,
): string {
  return `${PREVIEW_SESSION_ROOT}/${sessionId}/outputs/watermark/color/${style}/${slotFilePrefix(
    sessionId,
    slotIndex,
  )}_color_${style}_v${version}`;
}

/** True for new folder-based watermarks and legacy `_wm` suffix paths. */
export function isWatermarkedPublicId(publicId: string): boolean {
  return publicId.includes("/watermark/") || publicId.endsWith("_wm");
}

/** Derive the clean (print) public id from a watermarked asset, including legacy paths. */
export function cleanPublicIdFromWatermarked(publicId: string): string {
  if (publicId.includes("/outputs/watermark/bw/")) {
    return publicId.replace("/outputs/watermark/bw/", "/outputs/bw/");
  }
  if (publicId.includes("/outputs/watermark/color/")) {
    return publicId.replace("/outputs/watermark/color/", "/outputs/color/");
  }
  if (publicId.endsWith("_wm")) {
    return publicId.slice(0, -3);
  }
  return publicId;
}

/** Derive the watermarked preview public id from a clean asset, including legacy paths. */
export function previewPublicIdFromClean(cleanPublicId: string): string {
  if (cleanPublicId.includes("/outputs/watermark/")) {
    return cleanPublicId;
  }
  if (cleanPublicId.includes("/outputs/bw/")) {
    return cleanPublicId.replace("/outputs/bw/", "/outputs/watermark/bw/");
  }
  if (
    /\/outputs\/color\/(cartoon|pencil|watercolor|colorful|pens)\//.test(
      cleanPublicId,
    )
  ) {
    return cleanPublicId.replace("/outputs/color/", "/outputs/watermark/color/");
  }
  return `${cleanPublicId}_wm`;
}

export function nextBwVersion(slot: PreviewSession["slots"][number]): number {
  return (
    slot.nextBwVersion ??
    Math.max(
      0,
      ...slot.candidates
        .filter((candidate) => candidate.kind === "bw")
        .map((candidate) => candidate.version ?? 0),
    ) + 1
  );
}

export function nextColorVersion(slot: PreviewSession["slots"][number]): number {
  return nextColorVersionForStyle(slot, "pencil");
}

export function nextColorVersionForStyle(
  slot: PreviewSession["slots"][number],
  style: StyleType,
): number {
  const colorCandidates =
    slot.colorCandidates?.filter(
      (candidate) => candidate.kind === "color" && candidate.style === style,
    ) ?? [];
  const fromPreview =
    slot.colorPreview?.kind === "color" && slot.colorPreview.style === style
      ? [slot.colorPreview]
      : [];
  const versions = [...colorCandidates, ...fromPreview].map(
    (candidate) => candidate.version ?? 0,
  );
  return Math.max(0, ...versions, 0) + 1;
}

export function candidatePublicIds(
  candidate: PreviewCandidate,
): string[] {
  return [candidate.cleanPublicId, candidate.previewPublicId].filter(
    (publicId): publicId is string => Boolean(publicId),
  );
}

/** Unique path for crop uploads when signed overwrite is unavailable. */
export function prohibitedContentErrorPublicId(
  sessionId: string,
  kind: PreviewOutputKind,
  slotIndex: number,
  candidateId: string,
): string {
  return `${PREVIEW_SESSION_ROOT}/${sessionId}/errors/${kind}/${slotFilePrefix(
    sessionId,
    slotIndex,
  )}_${candidateId}_prohibited`;
}

export function cropRevisionPublicId(
  sessionId: string,
  kind: PreviewOutputKind,
  candidateId: string,
  revision: number,
): string {
  return `${PREVIEW_SESSION_ROOT}/${sessionId}/crops/${kind}/${candidateId}_r${revision}`;
}

export function cropRevisionWatermarkedPublicId(
  sessionId: string,
  kind: PreviewOutputKind,
  candidateId: string,
  revision: number,
): string {
  return `${cropRevisionPublicId(sessionId, kind, candidateId, revision)}_wm`;
}
