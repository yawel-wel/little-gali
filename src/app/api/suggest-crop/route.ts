import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import type { Area } from "react-easy-crop";
import {
  UPLOAD_CROP_ASPECT,
  cropAreaPixelsForSubject,
  expandUnionForUpperBody,
  rectArea,
  subjectCoversNearlyFullImage,
  unionRects,
  type PixelRect,
} from "@/lib/smartCropGeometry";

export const runtime = "nodejs";
export const maxDuration = 30;

// --- Tunables (smart crop behavior) ------------------------------------------
/** Longest edge of image sent to Vision (speed + cost). */
const VISION_MAX_EDGE = 1600;
const FACE_CONFIDENCE_MIN = 0.45;
const OBJECT_SCORE_MIN = 0.35;
/**
 * Padding around the subject union before fitting portrait aspect.
 * Lower = tighter framing (less background).
 */
const PADDING_FRACTION = 0.055;
/**
 * When ≥2 faces are detected, if union(faces+Person+pets) is this many times larger
 * than union(faces) alone, Vision’s Person boxes are treated as “scene loose” and
 * ignored for framing—use face union + upper-body expansion (+ pets) instead.
 */
const FACE_LOOSE_AREA_RATIO = 2.0;
/** If the subject union covers this much of the image, skip smart crop. */
const FULL_IMAGE_SUBJECT_RATIO = 0.9;
/** If the final crop uses more than this fraction of image area, return fallback. */
const MAX_SUGGESTED_CROP_AREA_RATIO = 0.88;

const OBJECT_NAMES = new Set(["Person", "Dog", "Cat"]);

type VisionVertex = { x?: number; y?: number };

function bboxFromPixelVertices(vertices: VisionVertex[]): PixelRect | null {
  if (!vertices?.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const v of vertices) {
    const x = v.x ?? 0;
    const y = v.y ?? 0;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  if (!Number.isFinite(minX)) return null;
  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

function bboxFromNormalizedVertices(
  vertices: VisionVertex[],
  imageWidth: number,
  imageHeight: number,
): PixelRect | null {
  if (!vertices?.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const v of vertices) {
    const x = (v.x ?? 0) * imageWidth;
    const y = (v.y ?? 0) * imageHeight;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  if (!Number.isFinite(minX)) return null;
  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

type VisionFace = {
  fdBoundingPoly?: { vertices?: VisionVertex[] };
  boundingPoly?: { vertices?: VisionVertex[] };
  detectionConfidence?: number;
};

type VisionObject = {
  name?: string;
  score?: number;
  boundingPoly?: { normalizedVertices?: VisionVertex[] };
};

type VisionResponse = {
  responses?: Array<{
    faceAnnotations?: VisionFace[];
    localizedObjectAnnotations?: VisionObject[];
    error?: { message?: string };
  }>;
};

function collectSeparatedRects(
  visionW: number,
  visionH: number,
  faces: VisionFace[],
  objects: VisionObject[],
): {
  faceRects: PixelRect[];
  personRects: PixelRect[];
  petRects: PixelRect[];
  faceHeightSum: number;
} {
  const faceRects: PixelRect[] = [];
  const personRects: PixelRect[] = [];
  const petRects: PixelRect[] = [];
  let faceHeightSum = 0;

  for (const face of faces) {
    const conf = face.detectionConfidence ?? 1;
    if (conf < FACE_CONFIDENCE_MIN) continue;
    const poly = face.fdBoundingPoly ?? face.boundingPoly;
    const b = bboxFromPixelVertices(poly?.vertices ?? []);
    if (b) {
      faceRects.push(b);
      faceHeightSum += b.height;
    }
  }

  for (const obj of objects) {
    const name = obj.name ?? "";
    if (!OBJECT_NAMES.has(name)) continue;
    const score = obj.score ?? 0;
    if (score < OBJECT_SCORE_MIN) continue;
    const b = bboxFromNormalizedVertices(
      obj.boundingPoly?.normalizedVertices ?? [],
      visionW,
      visionH,
    );
    if (!b) continue;
    if (name === "Person") personRects.push(b);
    else petRects.push(b);
  }

  return { faceRects, personRects, petRects, faceHeightSum };
}

/**
 * Build subject rectangle in vision pixel space: face-led when Person boxes are
 * much looser than face union (≥2 faces), else legacy union + upper-body rule.
 */
function buildSubjectRegion(
  visionH: number,
  faceRects: PixelRect[],
  personRects: PixelRect[],
  petRects: PixelRect[],
  faceHeightSum: number,
): PixelRect | null {
  const faceRectCount = faceRects.length;
  const hasPersonLikeObject = personRects.length > 0;
  const allRects = [...faceRects, ...personRects, ...petRects];
  if (allRects.length === 0) return null;

  const unionAll = unionRects(allRects);
  if (!unionAll) return null;

  const unionFaces = faceRectCount > 0 ? unionRects(faceRects) : null;

  if (faceRectCount >= 2 && unionFaces) {
    const areaAll = rectArea(unionAll);
    const areaFaces = rectArea(unionFaces);
    if (areaFaces > 0 && areaAll > FACE_LOOSE_AREA_RATIO * areaFaces) {
      let subject = expandUnionForUpperBody(unionFaces, faceHeightSum, visionH);
      if (petRects.length > 0) {
        const petUnion = unionRects(petRects);
        if (petUnion) {
          const merged = unionRects([subject, petUnion]);
          if (merged) subject = merged;
        }
      }
      return subject;
    }
  }

  let subject = unionAll;
  if (faceRectCount > 0 && !hasPersonLikeObject) {
    subject = expandUnionForUpperBody(subject, faceHeightSum, visionH);
  }
  return subject;
}

function mapAreaToOriginalImage(
  area: Area,
  visionW: number,
  visionH: number,
  origW: number,
  origH: number,
): Area {
  const sx = origW / visionW;
  const sy = origH / visionH;
  return {
    x: Math.round(area.x * sx),
    y: Math.round(area.y * sy),
    width: Math.round(area.width * sx),
    height: Math.round(area.height * sy),
  };
}

function mapFaceRectsToOriginal(
  faceRects: PixelRect[],
  visionW: number,
  visionH: number,
  origW: number,
  origH: number,
): Area[] {
  return faceRects.map((r) =>
    mapAreaToOriginalImage(
      { x: r.x, y: r.y, width: r.width, height: r.height },
      visionW,
      visionH,
      origW,
      origH,
    ),
  );
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: true, fallback: true, reason: "vision_not_configured" },
      { status: 200 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { ok: false, error: "No image provided" },
        { status: 400 },
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    // Apply EXIF orientation once and use this bitmap's dimensions as the canonical
    // "original" space for mapping Vision results. Browser <img> uses the same oriented
    // pixel grid (naturalWidth/height), which pre-rotate metadata width/height can mismatch.
    const oriented = await sharp(inputBuffer)
      .rotate()
      .toBuffer({ resolveWithObject: true });

    const origW = oriented.info.width;
    const origH = oriented.info.height;
    if (origW < 32 || origH < 32) {
      return NextResponse.json({ ok: true, fallback: true, reason: "too_small" });
    }

    const resized = await sharp(oriented.data)
      .resize({
        width: VISION_MAX_EDGE,
        height: VISION_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 88 })
      .toBuffer({ resolveWithObject: true });

    const visionBuffer = resized.data;
    const visionW = resized.info.width;
    const visionH = resized.info.height;

    const base64 = visionBuffer.toString("base64");
    const visionBody = {
      requests: [
        {
          image: { content: base64 },
          features: [
            { type: "FACE_DETECTION", maxResults: 20 },
            { type: "OBJECT_LOCALIZATION", maxResults: 20 },
          ],
        },
      ],
    };

    const annotateRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visionBody),
      },
    );

    if (!annotateRes.ok) {
      const errText = await annotateRes.text();
      console.error("Vision API error:", annotateRes.status, errText.slice(0, 500));
      if (annotateRes.status === 403) {
        console.error(
          "Cloud Vision API may be disabled for this GCP project. Enable it: https://console.cloud.google.com/apis/library/vision.googleapis.com",
        );
        return NextResponse.json({
          ok: true,
          fallback: true,
          reason: "vision_api_disabled_or_denied",
        });
      }
      return NextResponse.json({ ok: true, fallback: true, reason: "vision_http_error" });
    }

    const visionJson = (await annotateRes.json()) as VisionResponse;
    const first = visionJson.responses?.[0];
    if (first?.error?.message) {
      console.error("Vision API response error:", first.error.message);
      return NextResponse.json({
        ok: true,
        fallback: true,
        reason: "vision_response_error",
        faceBoxes: [],
      });
    }

    const faces = first?.faceAnnotations ?? [];
    const objects = first?.localizedObjectAnnotations ?? [];

    const { faceRects, personRects, petRects, faceHeightSum } =
      collectSeparatedRects(visionW, visionH, faces, objects);

    const faceBoxes = mapFaceRectsToOriginal(
      faceRects,
      visionW,
      visionH,
      origW,
      origH,
    );

    const union = buildSubjectRegion(
      visionH,
      faceRects,
      personRects,
      petRects,
      faceHeightSum,
    );

    if (!union) {
      return NextResponse.json({
        ok: true,
        fallback: true,
        reason: "no_subjects",
        faceBoxes,
      });
    }

    if (
      subjectCoversNearlyFullImage(union, visionW, visionH, FULL_IMAGE_SUBJECT_RATIO)
    ) {
      return NextResponse.json({
        ok: true,
        fallback: true,
        reason: "subject_full_frame",
        faceBoxes,
      });
    }

    const cropVision = cropAreaPixelsForSubject(
      union,
      visionW,
      visionH,
      UPLOAD_CROP_ASPECT,
      PADDING_FRACTION,
    );

    const croppedAreaPixels = mapAreaToOriginalImage(
      cropVision,
      visionW,
      visionH,
      origW,
      origH,
    );

    const cropAreaFrac =
      (croppedAreaPixels.width * croppedAreaPixels.height) / (origW * origH);
    if (cropAreaFrac > MAX_SUGGESTED_CROP_AREA_RATIO) {
      return NextResponse.json({
        ok: true,
        fallback: true,
        reason: "suggested_crop_too_wide",
        faceBoxes,
      });
    }

    return NextResponse.json({
      ok: true,
      fallback: false,
      croppedAreaPixels,
      faceBoxes,
    });
  } catch (e) {
    console.error("suggest-crop error:", e);
    return NextResponse.json({ ok: true, fallback: true, reason: "server_error" });
  }
}
