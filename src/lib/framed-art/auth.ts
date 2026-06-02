import { NextResponse } from "next/server";
import { isFramedArtEnabled } from "@/lib/feature-flags";
import { getFramedArtSessionIdFromCookie } from "./cookies";
import { loadFramedArtSession } from "./store";
import type { FramedArtSession } from "./types";

export function assertFramedArtEnabled(): NextResponse | null {
  if (!isFramedArtEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

export async function requireFramedArtSession(
  sessionId: string,
): Promise<{ session: FramedArtSession } | NextResponse> {
  const disabled = assertFramedArtEnabled();
  if (disabled) return disabled;

  const cookieSessionId = await getFramedArtSessionIdFromCookie();
  if (!cookieSessionId || cookieSessionId !== sessionId) {
    return NextResponse.json({ error: "Unauthorized session" }, { status: 403 });
  }

  const session = await loadFramedArtSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return { session };
}
