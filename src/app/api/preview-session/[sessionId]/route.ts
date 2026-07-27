import { NextRequest, NextResponse } from "next/server";
import { applyMixpanelDistinctIdFromRequest } from "@/lib/analytics-context";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import {
  clearStaleColorInFlight,
  savePreviewSession,
  toPublicView,
} from "@/lib/preview-session/store";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requirePreviewSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  let dirty = false;
  if (applyMixpanelDistinctIdFromRequest(auth.session, request)) {
    dirty = true;
  }
  if (clearStaleColorInFlight(auth.session)) {
    dirty = true;
  }
  if (dirty) {
    await savePreviewSession(auth.session);
  }

  return NextResponse.json({ session: toPublicView(auth.session) });
}
