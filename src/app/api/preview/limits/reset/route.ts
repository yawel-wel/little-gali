import { NextRequest, NextResponse } from "next/server";
import { isPreviewEnabled } from "@/lib/preview-session/auth";
import { resetPreviewLimitsForClient } from "@/lib/preview-session/full-generation-limits";
import { isPreviewLimitsDevResetAllowed } from "@/lib/preview-session/preview-limits-bypass";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isPreviewLimitsDevResetAllowed()) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  if (!isPreviewEnabled()) {
    return NextResponse.json({ error: "Preview is disabled" }, { status: 403 });
  }

  try {
    const snapshot = await resetPreviewLimitsForClient(request);
    return NextResponse.json({
      ok: true,
      previewEnabled: true,
      ...snapshot,
    });
  } catch (error) {
    console.error("Preview limits reset error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
