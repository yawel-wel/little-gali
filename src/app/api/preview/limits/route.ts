import { NextRequest, NextResponse } from "next/server";
import { isPreviewEnabled } from "@/lib/preview-session/auth";
import { getPreviewLimitsSnapshot } from "@/lib/preview-session/full-generation-limits";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isPreviewEnabled()) {
    return NextResponse.json({
      previewEnabled: false,
      windowHours: 12,
      fullGenerationLimit: 2,
      fullGenerationsUsed: 0,
      fullGenerationsRemaining: 2,
      isLastFullGenerationAvailable: false,
      resetAt: null,
      limitsBypassed: false,
      limitsEnforced: true,
      devResetAvailable: false,
    });
  }

  try {
    const snapshot = await getPreviewLimitsSnapshot(request);
    return NextResponse.json({
      previewEnabled: true,
      ...snapshot,
    });
  } catch (error) {
    console.error("Preview limits error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
