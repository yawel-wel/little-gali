import type { Area } from "react-easy-crop";

/** Portrait crop aspect used in the upload editor (width / height). */
export const UPLOAD_CROP_ASPECT = 72 / 84;

export type PixelRect = { x: number; y: number; width: number; height: number };

export function rectArea(r: PixelRect): number {
  return r.width * r.height;
}

/** Intersection area of two axis-aligned rectangles (pixel coords). */
export function intersectionAreaRects(a: PixelRect, b: PixelRect): number {
  const x0 = Math.max(a.x, b.x);
  const y0 = Math.max(a.y, b.y);
  const x1 = Math.min(a.x + a.width, b.x + b.width);
  const y1 = Math.min(a.y + a.height, b.y + b.height);
  if (x1 <= x0 || y1 <= y0) return 0;
  return (x1 - x0) * (y1 - y0);
}

/**
 * Min fraction of each face box that must lie inside the crop for that face to count as "ok".
 * Below this (e.g. portrait crop cuts off part of a face) triggers a user warning.
 */
export const FACE_MIN_FRACTION_INSIDE_CROP = 0.85;

/** True if any detected face is mostly outside the current crop rectangle. */
export function anyFaceClippedByCrop(
  faceBoxes: PixelRect[],
  crop: PixelRect,
  minInsideRatio: number = FACE_MIN_FRACTION_INSIDE_CROP,
): boolean {
  for (const face of faceBoxes) {
    const fa = rectArea(face);
    if (fa <= 0) continue;
    const inter = intersectionAreaRects(face, crop);
    if (inter / fa < minInsideRatio) return true;
  }
  return false;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Union of axis-aligned rectangles (pixel coords). */
export function unionRects(rects: PixelRect[]): PixelRect | null {
  if (rects.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Expand subject union downward for upper-body headroom when we only have face boxes.
 * `faceStackHeight` = sum of face heights (rough proxy for “how much face signal we have”).
 */
export function expandUnionForUpperBody(
  union: PixelRect,
  faceStackHeight: number,
  imageHeight: number,
): PixelRect {
  const faceHeights = faceStackHeight > 0 ? faceStackHeight : union.height;
  const down = Math.min(imageHeight - (union.y + union.height), faceHeights * 1.15);
  return {
    x: union.x,
    y: union.y,
    width: union.width,
    height: union.height + Math.max(0, down),
  };
}

/**
 * Minimum crop rectangle with given width/height aspect that fully contains `subject`,
 * centered on subject when possible, clamped to image bounds.
 */
export function cropAreaPixelsForSubject(
  subject: PixelRect,
  imageWidth: number,
  imageHeight: number,
  aspect: number,
  paddingFraction: number,
): Area {
  const padX = subject.width * paddingFraction;
  const padY = subject.height * paddingFraction;
  const sx = subject.x - padX;
  const sy = subject.y - padY;
  const sw = Math.max(1, subject.width + 2 * padX);
  const sh = Math.max(1, subject.height + 2 * padY);

  let cropW = Math.max(sw, sh * aspect);
  let cropH = cropW / aspect;

  if (cropW > imageWidth || cropH > imageHeight) {
    const scale = Math.min(imageWidth / cropW, imageHeight / cropH, 1);
    cropW *= scale;
    cropH *= scale;
  }

  const cx = sx + sw / 2;
  const cy = sy + sh / 2;
  let x = cx - cropW / 2;
  let y = cy - cropH / 2;

  x = clamp(x, 0, Math.max(0, imageWidth - cropW));
  y = clamp(y, 0, Math.max(0, imageHeight - cropH));

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(cropW),
    height: Math.round(cropH),
  };
}

/** If subject covers almost the whole image, smart crop is not useful. */
export function subjectCoversNearlyFullImage(
  subject: PixelRect,
  imageWidth: number,
  imageHeight: number,
  minReductionRatio: number,
): boolean {
  const si = subject.width * subject.height;
  const full = imageWidth * imageHeight;
  return si / full >= minReductionRatio;
}
