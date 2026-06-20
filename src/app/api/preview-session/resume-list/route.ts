import { NextRequest, NextResponse } from "next/server";
import { isPreviewEnabled } from "@/lib/preview-session/auth";
import { isUuid } from "@/lib/preview-session/cloudinary-paths";
import {
  PREVIEW_RESUME_DISPLAY_LIMIT,
  PREVIEW_RESUME_LIST_MAX_IDS,
  toPreviewSessionResumeSummary,
  type PreviewSessionResumeSummary,
} from "@/lib/preview-session/resume-summary";
import { loadPreviewSession } from "@/lib/preview-session/store";

export const runtime = "nodejs";

function readSessionIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || !isUuid(entry) || ids.includes(entry)) {
      continue;
    }
    ids.push(entry);
    if (ids.length >= PREVIEW_RESUME_LIST_MAX_IDS) {
      break;
    }
  }
  return ids;
}

export async function POST(request: NextRequest) {
  if (!isPreviewEnabled()) {
    return NextResponse.json({ sessions: [] satisfies PreviewSessionResumeSummary[] });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      sessionIds?: unknown;
    };
    const sessionIds = readSessionIds(body.sessionIds);
    if (sessionIds.length === 0) {
      return NextResponse.json({ sessions: [] satisfies PreviewSessionResumeSummary[] });
    }

    const loaded = await Promise.all(
      sessionIds.map(async (sessionId) => loadPreviewSession(sessionId)),
    );

    const sessions = loaded
      .filter((session): session is NonNullable<typeof session> => session !== null)
      .map(toPreviewSessionResumeSummary)
      .filter((summary): summary is PreviewSessionResumeSummary => summary !== null)
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      )
      .slice(0, PREVIEW_RESUME_DISPLAY_LIMIT);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Preview resume list error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
