import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function uploadToCloudinary(
  file: File | Buffer,
  mimeType: string,
  cloudName: string,
  uploadPreset: string,
  folder: string = "little-gali"
): Promise<string> {
  const formData = new FormData();

  if (file instanceof File) {
    formData.append("file", file);
  } else {
    // Convert Buffer to base64 data URL for Cloudinary
    const base64 = file.toString("base64");
    formData.append("file", `data:${mimeType};base64,${base64}`);
  }

  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = await response.json();
  return data.secure_url;
}

export async function POST(request: NextRequest) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        {
          error:
            "Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET",
        },
        { status: 500 }
      );
    }

    // Per-user folder: little-gali/users/{token} if token present, else little-gali
    const anonToken = request.headers.get("x-anon-token");
    const folder = anonToken
      ? `little-gali/users/${anonToken}`
      : "little-gali";

    const contentType = request.headers.get("content-type") ?? "";

    // Path 1: base64 JSON payload (for generated images)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { base64, mimeType = "image/png" } = body as {
        base64: string;
        mimeType?: string;
      };

      if (!base64) {
        return NextResponse.json(
          { error: "base64 field is required" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(base64, "base64");
      const url = await uploadToCloudinary(buffer, mimeType, cloudName, uploadPreset, folder);

      return NextResponse.json({ success: true, imageUrls: [url] });
    }

    // Path 2: FormData (original user image uploads)
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file, file.type, cloudName, uploadPreset, folder)
    );

    const imageUrls = await Promise.all(uploadPromises);

    return NextResponse.json({ success: true, imageUrls });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload images" },
      { status: 500 }
    );
  }
}
