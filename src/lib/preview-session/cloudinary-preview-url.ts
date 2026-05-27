/** Delivery URL for preview UI: same asset as clean, with an on-the-fly watermark transform. */
export function buildWatermarkedPreviewDeliveryUrl(publicId: string): string {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured");
  }

  const label = encodeURIComponent("Little Gali");
  const transform = [
    `l_text:Arial_24_bold:${label}`,
    "co_rgb:000000",
    "o_18",
    "a_-28",
    "fl_layer_apply",
    "fl_tiled",
  ].join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`;
}
