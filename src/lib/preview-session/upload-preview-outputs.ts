import type { StyleType } from "@/components/style-selector";
import { uploadBufferToCloudinaryPublicId } from "./cloudinary";
import type { CloudinaryUploadResult } from "./cloudinary";
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

  const upload = await uploadBufferToCloudinaryPublicId(cleanBuffer, cleanPath);

  return {
    cleanUpload: upload,
    previewUpload: { secureUrl: upload.secureUrl, publicId: upload.publicId },
  };
}
