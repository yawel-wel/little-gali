import { after, NextRequest, NextResponse } from "next/server";
import { applyMixpanelDistinctIdFromRequest } from "@/lib/analytics-context";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { logPreviewPipelineBackgroundFailed } from "@/lib/preview-session/generation-log";
import {
  markSessionPipelineFailed,
  maybeMigrateLegacyClassicBwReview,
  runColorPipelineForApprovedSession,
} from "@/lib/preview-session/preview-pipeline";
import {
  clearStaleColorInFlight,
  savePreviewSession,
  toPublicView,
} from "@/lib/preview-session/store";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const migrated = await maybeMigrateLegacyClassicBwReview(auth.session);
  if (migrated.scheduledColor) {
    after(async () => {
      try {
        await runColorPipelineForApprovedSession(sessionId);
      } catch (error) {
        console.error("Background color pipeline failed:", sessionId, error);
        logPreviewPipelineBackgroundFailed(sessionId, "color", error);
        await markSessionPipelineFailed(sessionId, error);
      }
    });
  }

  return NextResponse.json({ session: toPublicView(migrated.session) });
}
