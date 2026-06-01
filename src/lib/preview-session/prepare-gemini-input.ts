import sharp from "sharp";

/** Max edge length sent to Gemini (smaller = faster upload + inference). */
const GEMINI_INPUT_MAX_DIMENSION = 1024;
const GEMINI_INPUT_JPEG_QUALITY = 80;

export async function downloadImageAsBase64ForGemini(
  imageUrl: string,
): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download source image (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const prepared = await sharp(buffer)
    .rotate()
    .resize(GEMINI_INPUT_MAX_DIMENSION, GEMINI_INPUT_MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: GEMINI_INPUT_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return {
    base64: prepared.toString("base64"),
    mimeType: "image/jpeg",
  };
}
