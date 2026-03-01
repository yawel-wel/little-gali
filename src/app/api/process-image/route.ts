import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  console.log("🎨 Processing image - starting...");
  
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      console.error("❌ No image provided");
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log(`📸 File: ${file.name}, ${file.size} bytes, ${file.type}`);

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();
    console.log(`📊 Original dimensions: ${metadata.width}x${metadata.height}`);
    
    // SMART CROP & ENHANCE
    console.log("🔍 Analyzing image for intelligent cropping...");
    const { data, info } = await sharp(inputBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    console.log(`📊 Raw data: ${data.length} bytes, dimensions: ${info.width}x${info.height}, channels: ${info.channels}`);
    
    // Advanced subject detection using edge concentration
    const gridSize = 30; // Smaller grid for more precision
    const gridW = Math.ceil(info.width / gridSize);
    const gridH = Math.ceil(info.height / gridSize);
    const darkGrid: number[][] = Array(gridH).fill(0).map(() => Array(gridW).fill(0));
    
    let totalDarkPixels = 0;
    const threshold = 180; // More aggressive threshold
    
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const avg = (r + g + b) / 3;
        
        if (avg < threshold) {
          totalDarkPixels++;
          const gridX = Math.floor(x / gridSize);
          const gridY = Math.floor(y / gridSize);
          darkGrid[gridY][gridX]++;
        }
      }
    }
    
    console.log(`🔍 Found ${totalDarkPixels} dark pixels (threshold: ${threshold})`);
    
    // Find concentrated dark regions (subject area)
    const minDarkInCell = (gridSize * gridSize) * 0.25; // 25% dark pixels in cell
    let minX = gridW, minY = gridH, maxX = 0, maxY = 0;
    let cellsWithSubject = 0;
    
    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        if (darkGrid[gy][gx] > minDarkInCell) {
          cellsWithSubject++;
          minX = Math.min(minX, gx);
          minY = Math.min(minY, gy);
          maxX = Math.max(maxX, gx + 1);
          maxY = Math.max(maxY, gy + 1);
        }
      }
    }
    
    console.log(`📍 Grid analysis: ${cellsWithSubject} cells with concentrated dark pixels`);
    console.log(`📍 Grid bounds: minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY}`);
    
    let finalBuffer: Buffer;
    
    // Check if we found a reasonable subject area (not the entire image)
    const foundSubjectArea = cellsWithSubject > 0 && 
                             cellsWithSubject < (gridW * gridH * 0.85) && // Not more than 85% of image
                             (maxX - minX) < gridW * 0.95 && // Width less than 95% of image
                             (maxY - minY) < gridH * 0.95; // Height less than 95% of image
    
    if (foundSubjectArea) {
      // Convert grid coordinates to pixels with generous padding
      const padding = 0.15; // 15% padding
      const cropWidth = (maxX - minX) * gridSize;
      const cropHeight = (maxY - minY) * gridSize;
      const padX = Math.floor(cropWidth * padding);
      const padY = Math.floor(cropHeight * padding);
      
      const pixelMinX = Math.max(0, minX * gridSize - padX);
      const pixelMinY = Math.max(0, minY * gridSize - padY);
      const pixelMaxX = Math.min(info.width, maxX * gridSize + padX);
      const pixelMaxY = Math.min(info.height, maxY * gridSize + padY);
      
      const finalCropWidth = pixelMaxX - pixelMinX;
      const finalCropHeight = pixelMaxY - pixelMinY;
      
      const cropPercentage = ((1 - (finalCropWidth * finalCropHeight) / (info.width * info.height)) * 100).toFixed(1);
      console.log(`✂️ CROPPING: x=${pixelMinX}, y=${pixelMinY}, w=${finalCropWidth}, h=${finalCropHeight}`);
      console.log(`📊 Reducing image size by ${cropPercentage}%`);
      
      finalBuffer = await sharp(inputBuffer)
        .extract({ 
          left: pixelMinX, 
          top: pixelMinY, 
          width: finalCropWidth, 
          height: finalCropHeight 
        })
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .normalize() // Auto-level
        .modulate({ brightness: 1.25, saturation: 1.35 }) // Strong enhancement
        .sharpen({ sigma: 2.5 }) // Strong sharpening
        .linear(1.3, -(128 * 0.3)) // Strong contrast
        .jpeg({ quality: 95, mozjpeg: true })
        .toBuffer();
        
      console.log("✅ Smart-cropped and enhanced!");
      
    } else {
      console.warn("⚠️ No clear subject area detected - applying enhancement only");
      console.warn(`⚠️ (Found ${cellsWithSubject} subject cells out of ${gridW * gridH} total)`);
      
      // Just enhance without cropping
      finalBuffer = await sharp(inputBuffer)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .normalize()
        .modulate({ brightness: 1.25, saturation: 1.35 })
        .sharpen({ sigma: 2.5 })
        .linear(1.3, -(128 * 0.3))
        .jpeg({ quality: 95, mozjpeg: true })
        .toBuffer();
        
      console.log("✅ Enhanced without cropping");
    }

    const base64Image = finalBuffer.toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;
    
    console.log(`✅ Complete! Output size: ${base64Image.length} chars`);

    return NextResponse.json({
      success: true,
      processedImage: dataUrl,
      method: foundSubjectArea ? "smart-cropped" : "enhanced-only",
      cropApplied: foundSubjectArea
    });
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
