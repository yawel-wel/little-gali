import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

// Simple test endpoint - just adds a red border to prove processing works
export async function POST(request: NextRequest) {
  console.log("🧪 TEST ENDPOINT - Processing image...");
  
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log(`📸 Test processing: ${file.name}, ${file.size} bytes`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Add a very obvious red border to prove processing is working
    const processedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .extend({
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
        background: { r: 255, g: 0, b: 0, alpha: 1 } // Bright red border
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .modulate({ brightness: 1.3, saturation: 1.5 }) // Very obvious enhancement
      .sharpen({ sigma: 3 }) // Strong sharpening
      .jpeg({ quality: 90 })
      .toBuffer();

    const base64Image = processedBuffer.toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;
    
    console.log(`✅ Test processing complete! Size: ${base64Image.length} chars`);

    return NextResponse.json({
      success: true,
      processedImage: dataUrl,
    });
  } catch (error: any) {
    console.error("❌ Test endpoint error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
