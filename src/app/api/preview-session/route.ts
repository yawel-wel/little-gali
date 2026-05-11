import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isPreviewEnabled, requirePreviewSession } from "@/lib/preview-session/auth";
import { isAllowedCloudinaryUrl } from "@/lib/preview-session/cloudinary";
import {
  PREVIEW_SESSION_COOKIE,
  previewSessionCookieOptions,
  signPreviewSessionId,
} from "@/lib/preview-session/cookies";
import { runInitialParallelGeneration } from "@/lib/preview-session/generation-runner";
import { getRequestIp, hashClientIp } from "@/lib/preview-session/hash";
import { checkNewSessionRateLimit } from "@/lib/preview-session/rate-limit";
import {
  createEmptySlots,
  savePreviewSession,
  toPublicView,
} from "@/lib/preview-session/store";
import type { PreviewSession } from "@/lib/preview-session/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  if (!isPreviewEnabled()) {
    return NextResponse.json({ error: "Preview is disabled" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { originalUrls?: string[] };
    const originalUrls = body.originalUrls ?? [];

    if (originalUrls.length !== 5) {
      return NextResponse.json(
        { error: "Exactly five original image URLs are required" },
        { status: 400 },
      );
    }

    if (!originalUrls.every(isAllowedCloudinaryUrl)) {
      return NextResponse.json(
        { error: "All images must be uploaded to Cloudinary first" },
        { status: 400 },
      );
    }

    const ipHash = hashClientIp(getRequestIp(request));
    const rate = await checkNewSessionRateLimit(ipHash);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many preview sessions. Please try again later." },
        { status: 429 },
      );
    }

    const sessionId = randomUUID();
    const now = new Date().toISOString();
    const session: PreviewSession = {
      id: sessionId,
      phase: "bw_review",
      changeCreditsRemaining: 3,
      slots: createEmptySlots(originalUrls),
      createdAt: now,
      updatedAt: now,
      clientIpHash: ipHash,
    };

    await savePreviewSession(session);

    const cookieStore = await cookies();
    cookieStore.set(
      PREVIEW_SESSION_COOKIE,
      signPreviewSessionId(sessionId),
      previewSessionCookieOptions(),
    );

    const updated = await runInitialParallelGeneration(sessionId);
    if (!updated) {
      return NextResponse.json({ error: "Failed to initialize preview" }, { status: 500 });
    }

    return NextResponse.json({ session: toPublicView(updated) });
  } catch (error) {
    console.error("Preview session start error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const auth = await requirePreviewSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json({ session: toPublicView(auth.session) });
}
