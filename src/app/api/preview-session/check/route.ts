import { NextRequest, NextResponse } from "next/server";
import { isPreviewEnabled } from "@/lib/preview-session/auth";
import { isUuid } from "@/lib/preview-session/cloudinary-paths";
import { checkPreviewStartEligibility } from "@/lib/preview-session/check-preview-start";
import { PREVIEW_RATE_LIMIT_ERROR_CODE } from "@/lib/preview-session/constants";
import { logPreviewFullGenerationRateLimited } from "@/lib/preview-session/log-preview-rate-limit";

export const runtime = "nodejs";

function readRequestedSessionId(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  if (!isUuid(value)) {
    return undefined;
  }
  return value;
}

export async function POST(request: NextRequest) {
  if (!isPreviewEnabled()) {
    return NextResponse.json({ allowed: true });
  }

  try {
    const body = (await request.json()) as { sessionId?: string };
    const requestedSessionId = readRequestedSessionId(body.sessionId);
    const result = await checkPreviewStartEligibility(request, requestedSessionId);

    if (!result.allowed) {
      if (result.error === PREVIEW_RATE_LIMIT_ERROR_CODE) {
        logPreviewFullGenerationRateLimited("check");
      }
      return NextResponse.json(
        {
          allowed: false,
          error: result.error,
          sessionId: result.sessionId,
        },
        { status: 429 },
      );
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    console.error("Preview start check error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
