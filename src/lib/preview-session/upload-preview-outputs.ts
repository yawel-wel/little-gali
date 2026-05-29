import type { StyleType } from "@/components/style-selector";
import { uploadBufferToCloudinaryPublicId } from "./cloudinary";
import type { CloudinaryUploadResult } from "./cloudinary";
import {
  colorOutputPublicId,
  outputPublicId,
  watermarkedColorOutputPublicId,
  watermarkedOutputPublicId,
  type PreviewOutputKind,
} from "./cloudinary-paths";
import { applyPreviewWatermark } from "./watermark";

export async function uploadCleanAndWatermarkedOutputs(
  cleanBuffer: Buffer,
  sessionId: string,
  kind: PreviewOutputKind,
  slotIndex: number,
  version: number,
  colorStyle?: StyleType,
): Promise<{
  cleanUpload: CloudinaryUploadResult;
  previewUpload: CloudinaryUploadResult;
}> {
  const cleanPath =
    kind === "color" && colorStyle
      ? colorOutputPublicId(sessionId, slotIndex, colorStyle, version)
      : outputPublicId(sessionId, kind, slotIndex, version);

  const cleanUpload = await uploadBufferToCloudinaryPublicId(cleanBuffer, cleanPath);
  const watermarkedBuffer = await applyPreviewWatermark(cleanBuffer);
  const previewPath =
    kind === "color" && colorStyle
      ? watermarkedColorOutputPublicId(sessionId, slotIndex, colorStyle, version)
      : watermarkedOutputPublicId(sessionId, kind, slotIndex, version);
  const previewUpload = await uploadBufferToCloudinaryPublicId(
    watermarkedBuffer,
    previewPath,
  );

  return {
    cleanUpload,
    previewUpload: {
      secureUrl: previewUpload.secureUrl,
      publicId: previewUpload.publicId,
    },
  };
}
