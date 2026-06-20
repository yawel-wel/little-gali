import { NextRequest, NextResponse } from "next/server";
import type { StyleType } from "@/components/style-selector";
import { assertGenerationRateLimit } from "@/lib/rate-limit/generation-limiter";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { DEFAULT_COLOR_STYLE, PREVIEW_COLOR_STYLES } from "@/lib/preview-session/color-by-style";
import {
  runColorGeneration,
  runSlotAllStylesColorGeneration,
} from "@/lib/preview-session/color-generation-runner";
import { savePreviewSession, toPublicView } from "@/lib/preview-session/store";

export const runtime = "nodejs";
export const maxDuration = 120;

function parseSlotIndexes(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const indexes = value.filter(
    (item): item is number =>
      typeof item === "number" &&
      Number.isInteger(item) &&
      item >= 0 &&
      item <= 4,
  );
  if (indexes.length === 0) {
    return undefined;
  }
  return [...new Set(indexes)];
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const generationLimit = await assertGenerationRateLimit(sessionId);
  if (generationLimit) {
    return generationLimit;
  }

  const auth = await requirePreviewSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json().catch(() => ({}))) as {
    style?: StyleType;
    slotIndexes?: unknown;
    allStylesForSlot?: boolean;
  };

  const slotIndexes = parseSlotIndexes(body.slotIndexes) ?? [0, 1, 2, 3, 4];
  const allStylesForSlot = body.allStylesForSlot === true;

  const session = auth.session;
  if (session.phase === "cart_added") {
    return NextResponse.json(
      { error: "Color preview is not available after cart submission" },
      { status: 409 },
    );
  }

  if (session.phase === "bw_review") {
    const allSlotsReady = session.slots.every((slot) => {
      const active = slot.candidates.find(
        (candidate) =>
          candidate.kind === "bw" && candidate.id === slot.activeCandidateId,
      );
      return Boolean(active?.previewUrl && !active.error);
    });
    if (!allSlotsReady) {
      return NextResponse.json(
        { error: "B&W preview is not ready for color generation" },
        { status: 409 },
      );
    }
  }

  if (allStylesForSlot) {
    let latest = session;
    for (const slotIndex of slotIndexes) {
      const updated = await runSlotAllStylesColorGeneration(sessionId, slotIndex, {
        trigger: "regenerate",
      });
      if (!updated) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      latest = updated;
    }
    return NextResponse.json({ session: toPublicView(latest) });
  }

  const style = body.style ?? DEFAULT_COLOR_STYLE;
  if (!PREVIEW_COLOR_STYLES.includes(style)) {
    return NextResponse.json({ error: "Invalid style" }, { status: 400 });
  }

  const isFullBookRequest =
    slotIndexes.length === 5 && [0, 1, 2, 3, 4].every((i) => slotIndexes.includes(i));

  if (isFullBookRequest) {
    const targetSlotsInFlight = slotIndexes.some(
      (index) => session.slots[index]?.colorInFlight,
    );
    if (targetSlotsInFlight) {
      return NextResponse.json({ session: toPublicView(session) });
    }
  }
  if (isFullBookRequest) {
    session.selectedColorStyle = style;
    await savePreviewSession(session);
  }

  const updated = await runColorGeneration(sessionId, style, slotIndexes);
  if (!updated) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session: toPublicView(updated) });
}
