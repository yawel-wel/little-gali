import sharp from "sharp";
import { formatUnknownError } from "./generation-errors";

/** Max edge length sent to Gemini (smaller = faster upload + inference). */
const GEMINI_INPUT_MAX_DIMENSION = 1024;
const GEMINI_INPUT_JPEG_QUALITY = 80;

function hostFromUrl(imageUrl: string): string {
  try {
    return new URL(imageUrl).host;
  } catch {
    return "invalid-url";
  }
}

export async function downloadImageAsBase64ForGemini(
  imageUrl: string,
): Promise<{ base64: string; mimeType: string }> {
  let response: Response;
  try {
    response = await fetch(imageUrl);
  } catch (error) {
    throw new Error(
      `Failed to download Gemini source from ${hostFromUrl(imageUrl)}: ${formatUnknownError(error)}`,
      { cause: error },
    );
  }
  if (!response.ok) {
    throw new Error(
      `Failed to download Gemini source from ${hostFromUrl(imageUrl)} (${response.status})`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const prepared = await sharp(buffer)
    .rotate()
    .resize(GEMINI_INPUT_MAX_DIMENSION, GEMINI_INPUT_MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: GEMINI_INPUT_JPEG_QUALITY })
    .toBuffer();

  return {
    base64: prepared.toString("base64"),
    mimeType: "image/jpeg",
  };
}
