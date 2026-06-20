import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isPreviewEnabled } from "@/lib/preview-session/auth";
import { isUuid } from "@/lib/preview-session/cloudinary-paths";
import {
  PREVIEW_SESSION_COOKIE,
  previewSessionCookieOptions,
  signPreviewSessionId,
} from "@/lib/preview-session/cookies";
import { isPreviewSessionResumable } from "@/lib/preview-session/resume-summary";
import { loadPreviewSession, savePreviewSession, toPublicView } from "@/lib/preview-session/store";

export const runtime = "nodejs";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  if (!isPreviewEnabled()) {
    return NextResponse.json({ error: "Preview is disabled" }, { status: 403 });
  }

  const { sessionId } = await context.params;
  if (!isUuid(sessionId)) {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  const session = await loadPreviewSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Preview session not found" }, { status: 404 });
  }

  if (!isPreviewSessionResumable(session)) {
    return NextResponse.json({ error: "Preview session not found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set(
    PREVIEW_SESSION_COOKIE,
    signPreviewSessionId(sessionId),
    previewSessionCookieOptions(),
  );

  await savePreviewSession(session);

  return NextResponse.json({ session: toPublicView(session) });
}
