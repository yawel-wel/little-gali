import { NextRequest, NextResponse } from "next/server";
import { isAllowedUploadImageType } from "@/lib/allowed-image-types";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { applyCropUploadToCandidate } from "@/lib/preview-session/apply-crop";
import {
  canSignCloudinaryUploads,
  overwriteCloudinaryAsset,
  overwriteCloudinaryBuffer,
  uploadBufferToCloudinaryPublicId,
} from "@/lib/preview-session/cloudinary";
import {
  cleanPublicIdFromWatermarked,
  cropRevisionPublicId,
  cropRevisionWatermarkedPublicId,
  isWatermarkedPublicId,
  previewPublicIdFromClean,
} from "@/lib/preview-session/cloudinary-paths";
import {
  assetPathFromPublicId,
  findCandidateInSession,
  type PreviewBookSide,
} from "@/lib/preview-session/find-candidate";
import {
  readIdempotentResponse,
  writeIdempotentResponse,
} from "@/lib/preview-session/idempotency";
import { savePreviewSession, toPublicView } from "@/lib/preview-session/store";
import type { PreviewPhase } from "@/lib/preview-session/types";
import { applyPreviewWatermark } from "@/lib/preview-session/watermark";

export const runtime = "nodejs";

function sessionAllowsCrop(phase: PreviewPhase): boolean {
  return (
    phase === "bw_review" ||
    phase === "bw_approved" ||
    phase === "style_selected" ||
    phase === "cart_added"
  );
}
export const maxDuration = 60;

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requirePreviewSession(sessionId);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const formData = await request.formData();
  const candidateId = String(formData.get("candidateId") ?? "").trim();
  const bookSide = String(formData.get("bookSide") ?? "").trim() as PreviewBookSide;
  const image = formData.get("image");
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "").trim();

  if (!candidateId || (bookSide !== "bw" && bookSide !== "color")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 });
  }

  if (!isAllowedUploadImageType(image)) {
    return NextResponse.json(
      { error: "Only JPG or PNG images are allowed" },
      { status: 400 },
    );
  }

  if (image.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "Image is too large (max 2MB)" },
      { status: 413 },
    );
  }

  if (idempotencyKey) {
    const cached = await readIdempotentResponse(sessionId, idempotencyKey);
    if (cached) {
      return NextResponse.json({ session: cached });
    }
  }

  const session = auth.session;
  if (!sessionAllowsCrop(session.phase)) {
    return NextResponse.json(
      { error: "Session is not in preview review" },
      { status: 409 },
    );
  }

  const found = findCandidateInSession(session, candidateId, bookSide);
  if (!found) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const { slotIndex, candidate } = found;
  const slot = session.slots[slotIndex];
  if (!slot) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 404 });
  }

  if (slot.inFlight || slot.colorInFlight) {
    return NextResponse.json(
      { error: "Image is still processing" },
      { status: 409 },
    );
  }

  const cleanPublicId =
    candidate.cleanPublicId ??
    (candidate.previewPublicId && isWatermarkedPublicId(candidate.previewPublicId)
      ? cleanPublicIdFromWatermarked(candidate.previewPublicId)
      : candidate.previewPublicId);
  if (!cleanPublicId || !candidate.previewUrl) {
    return NextResponse.json(
      { error: "No generated image to crop" },
      { status: 400 },
    );
  }

  try {
    const croppedBuffer = Buffer.from(await image.arrayBuffer());
    const cleanAssetPath = assetPathFromPublicId(cleanPublicId);
    const previewAssetPath =
      candidate.previewPublicId && isWatermarkedPublicId(candidate.previewPublicId)
        ? assetPathFromPublicId(candidate.previewPublicId)
        : assetPathFromPublicId(previewPublicIdFromClean(cleanPublicId));
    const watermarkedBuffer = await applyPreviewWatermark(croppedBuffer);

    let cleanUpload;
    let previewUpload;

    if (canSignCloudinaryUploads()) {
      cleanUpload = await overwriteCloudinaryAsset(image, cleanAssetPath);
      previewUpload = await overwriteCloudinaryBuffer(
        watermarkedBuffer,
        previewAssetPath,
      );
    } else {
      const revision = (candidate.cropRevision ?? 0) + 1;
      candidate.cropRevision = revision;
      cleanUpload = await uploadBufferToCloudinaryPublicId(
        croppedBuffer,
        cropRevisionPublicId(sessionId, bookSide, candidateId, revision),
      );
      previewUpload = await uploadBufferToCloudinaryPublicId(
        watermarkedBuffer,
        cropRevisionWatermarkedPublicId(
          sessionId,
          bookSide,
          candidateId,
          revision,
        ),
      );
    }

    const cacheVersion = Date.now();
    applyCropUploadToCandidate(
      candidate,
      cleanUpload,
      previewUpload,
      cacheVersion,
    );

    if (bookSide === "color" && slot.colorPreview?.id === candidateId) {
      slot.colorPreview = candidate;
    }

    await savePreviewSession(session);
    const publicView = toPublicView(session);

    if (idempotencyKey) {
      await writeIdempotentResponse(sessionId, idempotencyKey, publicView);
    }

    return NextResponse.json({ session: publicView });
  } catch (error) {
    console.error("Preview crop upload failed:", sessionId, candidateId, error);
    return NextResponse.json(
      { error: "Crop upload failed" },
      { status: 500 },
    );
  }
}
