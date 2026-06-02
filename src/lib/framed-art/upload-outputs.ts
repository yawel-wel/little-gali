import type { StyleType } from "@/components/style-selector";
import { uploadBufferToCloudinaryPublicId } from "@/lib/preview-session/cloudinary";
import type { CloudinaryUploadResult } from "@/lib/preview-session/cloudinary";
import { applyPreviewWatermark } from "@/lib/preview-session/watermark";
import {
  framedArtColorOutputPublicId,
  framedArtColorWatermarkedPublicId,
} from "./cloudinary-paths";

export async function uploadFramedArtOutputs(
  cleanBuffer: Buffer,
  sessionId: string,
  style: StyleType,
  version: number,
): Promise<{
  cleanUpload: CloudinaryUploadResult;
  previewUpload: CloudinaryUploadResult;
}> {
  const cleanPath = framedArtColorOutputPublicId(sessionId, style, version);
  const cleanUpload = await uploadBufferToCloudinaryPublicId(cleanBuffer, cleanPath, [
    `framed_art_session_${sessionId}`,
  ]);

  const watermarkedBuffer = await applyPreviewWatermark(cleanBuffer);
  const previewPath = framedArtColorWatermarkedPublicId(sessionId, style, version);
  const previewUpload = await uploadBufferToCloudinaryPublicId(
    watermarkedBuffer,
    previewPath,
    [`framed_art_session_${sessionId}`],
  );

  return { cleanUpload, previewUpload };
}
