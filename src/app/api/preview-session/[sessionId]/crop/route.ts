import { NextRequest, NextResponse } from "next/server";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { applyCropUploadToCandidate } from "@/lib/preview-session/apply-crop";
import {
  canSignCloudinaryUploads,
  overwriteCloudinaryAsset,
  uploadBufferToCloudinaryPublicId,
} from "@/lib/preview-session/cloudinary";
import { cropRevisionPublicId } from "@/lib/preview-session/cloudinary-paths";
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
import { applyPreviewWatermark } from "@/lib/preview-session/watermark";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

function isAllowedImage(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (ALLOWED_TYPES.has(mime)) {
    return true;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "jpg" || ext === "jpeg" || ext === "png";
}

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

  if (!isAllowedImage(image)) {
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
  if (session.phase !== "bw_review") {
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
    (candidate.previewPublicId?.endsWith("_wm")
      ? candidate.previewPublicId.slice(0, -3)
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
    const cleanUpload = canSignCloudinaryUploads()
      ? await overwriteCloudinaryAsset(image, cleanAssetPath)
      : await (async () => {
          const revision = (candidate.cropRevision ?? 0) + 1;
          candidate.cropRevision = revision;
          return uploadBufferToCloudinaryPublicId(
            croppedBuffer,
            cropRevisionPublicId(sessionId, bookSide, candidateId, revision),
          );
        })();

    const previewAssetPath = candidate.previewPublicId?.endsWith("_wm")
      ? assetPathFromPublicId(candidate.previewPublicId)
      : `${cleanAssetPath}_wm`;
    const watermarkedBuffer = await applyPreviewWatermark(croppedBuffer);
    const previewUpload = await uploadBufferToCloudinaryPublicId(
      watermarkedBuffer,
      previewAssetPath,
    );

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
