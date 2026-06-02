import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { assertFramedArtEnabled } from "@/lib/framed-art/auth";
import {
  FRAMED_ART_SESSION_COOKIE,
  clearBookPreviewSessionCookie,
  framedArtSessionCookieOptions,
  signFramedArtSessionId,
} from "@/lib/framed-art/cookies";
import { runFramedArtStyleGeneration } from "@/lib/framed-art/generation-runner";
import type { StyleType } from "@/components/style-selector";
import { saveFramedArtSession, toPublicView } from "@/lib/framed-art/store";
import type { FramedArtSession } from "@/lib/framed-art/types";
import { consumeFramedUploadSlot } from "@/lib/framed-art/upload-limits";
import { getRequestIp, hashClientIp } from "@/lib/preview-session/hash";
import {
  isAllowedCloudinaryUrl,
  publicIdFromCloudinaryUrl,
} from "@/lib/preview-session/cloudinary";

export const runtime = "nodejs";
export const maxDuration = 120;

const FRAMED_UPLOAD_LIMIT_ERROR = "framed_upload_limit";

const VALID_STYLES: StyleType[] = ["cartoon", "pencil", "watercolor"];

function scheduleGeneration(sessionId: string): void {
  void runFramedArtStyleGeneration(sessionId).catch((error) => {
    console.error("Framed art generation failed:", error);
  });
}

export async function POST(request: NextRequest) {
  const disabled = assertFramedArtEnabled();
  if (disabled) return disabled;

  const body = (await request.json().catch(() => ({}))) as {
    originalUrl?: string;
    style?: StyleType;
  };

  const originalUrl = body.originalUrl?.trim();
  const style = body.style;
  if (!originalUrl || !isAllowedCloudinaryUrl(originalUrl)) {
    return NextResponse.json(
      { error: "A valid uploaded image URL is required" },
      { status: 400 },
    );
  }
  if (!style || !VALID_STYLES.includes(style)) {
    return NextResponse.json({ error: "A valid style is required" }, { status: 400 });
  }

  const ipHash = hashClientIp(getRequestIp(request));
  const uploadSlot = await consumeFramedUploadSlot(ipHash);
  if (!uploadSlot.allowed) {
    return NextResponse.json(
      { error: FRAMED_UPLOAD_LIMIT_ERROR, remaining: 0, limit: uploadSlot.limit },
      { status: 429 },
    );
  }

  const sessionId = randomUUID();
  const now = new Date().toISOString();
  const session: FramedArtSession = {
    id: sessionId,
    phase: "uploaded",
    generationStatus: "not_started",
    originalUrl,
    originalPublicId: publicIdFromCloudinaryUrl(originalUrl) ?? undefined,
    selectedStyle: style,
    candidates: [],
    regenerateUsed: false,
    inFlight: false,
    createdAt: now,
    updatedAt: now,
  };

  await saveFramedArtSession(session);
  await clearBookPreviewSessionCookie();

  const cookieStore = await cookies();
  cookieStore.set(
    FRAMED_ART_SESSION_COOKIE,
    signFramedArtSessionId(sessionId),
    framedArtSessionCookieOptions(),
  );

  scheduleGeneration(sessionId);

  return NextResponse.json({
    session: toPublicView(session),
    uploadsRemaining: uploadSlot.remaining,
  });
}
