import { NextResponse } from "next/server";
import { getPreviewSessionIdFromCookie } from "./cookies";
import { loadPreviewSession } from "./store";
import type { PreviewSession } from "./types";

export async function requirePreviewSession(
  sessionId: string,
): Promise<{ session: PreviewSession } | NextResponse> {
  const cookieSessionId = await getPreviewSessionIdFromCookie();
  if (!cookieSessionId || cookieSessionId !== sessionId) {
    return NextResponse.json({ error: "Unauthorized preview session" }, { status: 403 });
  }

  const session = await loadPreviewSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Preview session not found" }, { status: 404 });
  }

  return { session };
}

export function isPreviewEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_PREVIEW_ENABLED === "true";
}
