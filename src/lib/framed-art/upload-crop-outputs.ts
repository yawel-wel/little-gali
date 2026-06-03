import type { StyleType } from "@/components/style-selector";
import {
  canSignCloudinaryUploads,
  uploadBufferToCloudinaryPublicId,
  overwriteCloudinaryBuffer,
  type CloudinaryUploadResult,
} from "@/lib/preview-session/cloudinary";
import { applyPreviewWatermark } from "@/lib/preview-session/watermark";
import {
  framedArtColorCroppedPublicId,
  framedArtColorCroppedWatermarkedPublicId,
} from "./cloudinary-paths";

async function uploadCropAsset(
  buffer: Buffer,
  assetPath: string,
  sessionId: string,
): Promise<CloudinaryUploadResult> {
  const tags = [`framed_art_session_${sessionId}`];
  if (canSignCloudinaryUploads()) {
    try {
      return await overwriteCloudinaryBuffer(buffer, assetPath);
    } catch {
      return uploadBufferToCloudinaryPublicId(buffer, assetPath, tags);
    }
  }
  return uploadBufferToCloudinaryPublicId(buffer, assetPath, tags);
}

export async function uploadFramedArtCropOutputs(
  cleanCropBuffer: Buffer,
  sessionId: string,
  style: StyleType,
  version: number,
): Promise<{
  cleanUpload: CloudinaryUploadResult;
  previewUpload: CloudinaryUploadResult;
}> {
  const cleanPath = framedArtColorCroppedPublicId(sessionId, style, version);
  const cleanUpload = await uploadCropAsset(
    cleanCropBuffer,
    cleanPath,
    sessionId,
  );

  const watermarkedBuffer = await applyPreviewWatermark(cleanCropBuffer);
  const previewPath = framedArtColorCroppedWatermarkedPublicId(
    sessionId,
    style,
    version,
  );
  const previewUpload = await uploadCropAsset(
    watermarkedBuffer,
    previewPath,
    sessionId,
  );

  return { cleanUpload, previewUpload };
}
