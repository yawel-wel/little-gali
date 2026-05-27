import type { StyleType } from "@/components/style-selector";
import { uploadBufferToCloudinaryPublicId } from "./cloudinary";
import type { CloudinaryUploadResult } from "./cloudinary";
import { buildWatermarkedPreviewDeliveryUrl } from "./cloudinary-preview-url";
import {
  colorOutputPublicId,
  outputPublicId,
  type PreviewOutputKind,
} from "./cloudinary-paths";

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
  const previewUrl = buildWatermarkedPreviewDeliveryUrl(cleanUpload.publicId);

  return {
    cleanUpload,
    previewUpload: {
      secureUrl: previewUrl,
      publicId: cleanUpload.publicId,
    },
  };
}
