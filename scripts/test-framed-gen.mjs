import { config } from "dotenv";
config({ path: ".env.local" });

const url =
  process.argv[2] ||
  "https://res.cloudinary.com/dvexwgpjf/image/upload/v1780431171/little-gali/alhyyrmewxhhpkfshijl.jpg";
const style = process.argv[3] || "pencil";

async function main() {
  const { generateColorImageBuffer } = await import(
    "../src/lib/preview-session/generate-color.ts"
  );
  const { uploadBufferToCloudinaryPublicId } = await import(
    "../src/lib/preview-session/cloudinary.ts"
  );
  const { framedArtColorOutputPublicId } = await import(
    "../src/lib/framed-art/cloudinary-paths.ts"
  );

  console.log("1) Gemini color generation...", { style });
  let buf;
  try {
    buf = await generateColorImageBuffer(url, style, {
      sessionId: "test-script",
      slot: 0,
      trigger: "initial",
      side: "color",
    });
    console.log("   OK", buf.length, "bytes");
  } catch (e) {
    console.error("   GEMINI FAIL:", e?.message ?? e);
    process.exit(1);
  }

  const { framedArtColorWatermarkedPublicId } = await import(
    "../src/lib/framed-art/cloudinary-paths.ts"
  );
  const { applyPreviewWatermark } = await import(
    "../src/lib/preview-session/watermark.ts"
  );

  const cleanPath = framedArtColorOutputPublicId("test-script", style, 1);
  console.log("2) Cloudinary clean upload...", cleanPath);
  try {
    const up = await uploadBufferToCloudinaryPublicId(buf, cleanPath);
    console.log("   OK", up.secureUrl);
  } catch (e) {
    console.error("   CLOUDINARY CLEAN FAIL:", e?.message ?? e);
    process.exit(1);
  }

  console.log("3) Watermark...");
  let wm;
  try {
    wm = await applyPreviewWatermark(buf);
    console.log("   OK", wm.length, "bytes");
  } catch (e) {
    console.error("   WATERMARK FAIL:", e?.message ?? e);
    process.exit(1);
  }

  const previewPath = framedArtColorWatermarkedPublicId("test-script", style, 1);
  console.log("4) Cloudinary preview upload...", previewPath);
  try {
    const up = await uploadBufferToCloudinaryPublicId(wm, previewPath);
    console.log("   OK", up.secureUrl);
  } catch (e) {
    console.error("   CLOUDINARY PREVIEW FAIL:", e?.message ?? e);
    process.exit(1);
  }
}

main();
