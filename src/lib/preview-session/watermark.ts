import sharp from "sharp";

export async function applyPreviewWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width ?? 1024;
  const height = metadata.height ?? 1024;
  const fontSize = Math.max(18, Math.round(Math.min(width, height) * 0.05));
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wm" width="${Math.round(width * 0.7)}" height="${Math.round(height * 0.35)}" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <text x="0" y="${fontSize}" fill="rgba(0,0,0,0.12)" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700">Little Gali</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm)" />
    </svg>
  `;

  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(svg), blend: "over" }])
    .png()
    .toBuffer();
}
