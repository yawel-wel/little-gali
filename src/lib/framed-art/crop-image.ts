import type { Area } from "react-easy-crop";
import sharp from "sharp";
import { isAllowedCloudinaryUrl } from "@/lib/preview-session/cloudinary";

export async function downloadAndCropCloudinaryImage(
  imageUrl: string,
  crop: Area,
): Promise<Buffer> {
  if (!isAllowedCloudinaryUrl(imageUrl)) {
    throw new Error("Invalid image URL");
  }

  const response = await fetch(imageUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to download image for cropping");
  }

  const source = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(source).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (!width || !height) {
    throw new Error("Could not read image dimensions");
  }

  const left = Math.max(0, Math.min(Math.round(crop.x), width - 1));
  const top = Math.max(0, Math.min(Math.round(crop.y), height - 1));
  const cropWidth = Math.max(
    1,
    Math.min(Math.round(crop.width), width - left),
  );
  const cropHeight = Math.max(
    1,
    Math.min(Math.round(crop.height), height - top),
  );

  return sharp(source)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .png()
    .toBuffer();
}
