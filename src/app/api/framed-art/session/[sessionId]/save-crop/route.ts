import type { Area } from "react-easy-crop";
import { NextRequest, NextResponse } from "next/server";
import type { StyleType } from "@/components/style-selector";
import { requireFramedArtSession } from "@/lib/framed-art/auth";
import { downloadAndCropCloudinaryImage } from "@/lib/framed-art/crop-image";
import { getCandidateForStyle, saveFramedArtSession, toPublicView } from "@/lib/framed-art/store";
import type { FramedArtCropState } from "@/lib/framed-art/types";
import { uploadFramedArtCropOutputs } from "@/lib/framed-art/upload-crop-outputs";

export const runtime = "nodejs";
export const maxDuration = 60;

function isValidCropArea(value: unknown): value is Area {
  if (!value || typeof value !== "object") {
    return false;
  }
  const area = value as Area;
  return (
    typeof area.x === "number" &&
    typeof area.y === "number" &&
    typeof area.width === "number" &&
    typeof area.height === "number" &&
    area.width > 0 &&
    area.height > 0
  );
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requireFramedArtSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json().catch(() => ({}))) as {
    croppedAreaPixels?: Area;
    crop?: { x: number; y: number };
    zoom?: number;
    style?: string;
  };

  if (!isValidCropArea(body.croppedAreaPixels)) {
    return NextResponse.json(
      { error: "Valid crop area is required" },
      { status: 400 },
    );
  }

  const style = (body.style ?? auth.session.selectedStyle) as StyleType | undefined;
  if (!style || !["cartoon", "pencil", "watercolor"].includes(style)) {
    return NextResponse.json({ error: "Style is required" }, { status: 400 });
  }

  const candidate = getCandidateForStyle(auth.session, style);
  if (!candidate?.cleanUrl) {
    return NextResponse.json(
      { error: "Generated image is not ready for cropping" },
      { status: 409 },
    );
  }

  if (auth.session.inFlight) {
    return NextResponse.json(
      { error: "Generation in progress" },
      { status: 409 },
    );
  }

  try {
    const cleanCropBuffer = await downloadAndCropCloudinaryImage(
      candidate.cleanUrl,
      body.croppedAreaPixels,
    );

    const { cleanUpload, previewUpload } = await uploadFramedArtCropOutputs(
      cleanCropBuffer,
      sessionId,
      style,
      candidate.version,
    );

    const cropState: FramedArtCropState = {
      crop: body.crop ?? { x: 0, y: 0 },
      zoom: typeof body.zoom === "number" ? body.zoom : 1,
      croppedAreaPixels: body.croppedAreaPixels,
    };

    candidate.croppedCleanUrl = cleanUpload.secureUrl;
    candidate.croppedCleanPublicId = cleanUpload.publicId;
    candidate.croppedPreviewUrl = previewUpload.secureUrl;
    candidate.croppedPreviewPublicId = previewUpload.publicId;
    candidate.cropState = cropState;

    await saveFramedArtSession(auth.session);

    return NextResponse.json({ session: toPublicView(auth.session) });
  } catch (error) {
    console.error("Framed art save-crop error:", sessionId, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save crop",
      },
      { status: 500 },
    );
  }
}
