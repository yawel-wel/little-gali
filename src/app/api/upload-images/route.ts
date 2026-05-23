import { NextRequest, NextResponse } from "next/server";
import { uploadImageFileToCloudinary } from "@/lib/preview-session/cloudinary";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    const imageUrls = await Promise.all(
      files.map((file) => uploadImageFileToCloudinary(file)),
    );

    return NextResponse.json({
      success: true,
      imageUrls: imageUrls,
    });
  } catch (error: unknown) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload images",
      },
      { status: 500 }
    );
  }
}
