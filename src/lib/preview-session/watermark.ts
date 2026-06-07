import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WATERMARK_FONT_FAMILY = "LittleGaliWatermark";
const WATERMARK_TEXT = "Little Gali";

let cachedFontBase64: string | undefined;

function resolveWatermarkFontPath(): string {
  const besideModule = join(
    dirname(fileURLToPath(import.meta.url)),
    "assets",
    "DejaVuSans-Bold.ttf",
  );
  if (existsSync(besideModule)) {
    return besideModule;
  }

  return join(
    process.cwd(),
    "src/lib/preview-session/assets/DejaVuSans-Bold.ttf",
  );
}

function getWatermarkFontBase64(): string {
  if (!cachedFontBase64) {
    cachedFontBase64 = readFileSync(resolveWatermarkFontPath()).toString("base64");
  }
  return cachedFontBase64;
}

function buildWatermarkSvg(width: number, height: number, fontSize: number): string {
  const fontBase64 = getWatermarkFontBase64();
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face {
            font-family: '${WATERMARK_FONT_FAMILY}';
            src: url('data:font/ttf;base64,${fontBase64}') format('truetype');
            font-weight: 700;
          }
        </style>
        <pattern id="wm" width="${Math.round(width * 0.62)}" height="${Math.round(height * 0.3)}" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <text x="0" y="${fontSize}" fill="rgba(0,0,0,0.18)" font-family="${WATERMARK_FONT_FAMILY}" font-size="${fontSize}" font-weight="700">${WATERMARK_TEXT}</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm)" />
    </svg>
  `;
}

export async function applyPreviewWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width ?? 1024;
  const height = metadata.height ?? 1024;
  const fontSize = Math.max(18, Math.round(Math.min(width, height) * 0.05));
  const svg = buildWatermarkSvg(width, height, fontSize);

  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(svg), blend: "over" }])
    .png()
    .toBuffer();
}
