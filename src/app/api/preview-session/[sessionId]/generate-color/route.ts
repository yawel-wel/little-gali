import { NextRequest, NextResponse } from "next/server";
import type { StyleType } from "@/components/style-selector";
import { assertGenerationRateLimit } from "@/lib/rate-limit/generation-limiter";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { parseBookFlow } from "@/lib/preview-session/book-flow";
import {
  getDefaultColorStyle,
  getPreviewColorStyles,
} from "@/lib/preview-session/color-by-style";
import {
  runColorGeneration,
  runSlotAllStylesColorGeneration,
} from "@/lib/preview-session/color-generation-runner";
import { savePreviewSession, toPublicView } from "@/lib/preview-session/store";

export const runtime = "nodejs";
export const maxDuration = 120;

function parseSlotIndexes(
  value: unknown,
  maxSlotIndex: number,
): number[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const indexes = value.filter(
    (item): item is number =>
      typeof item === "number" &&
      Number.isInteger(item) &&
      item >= 0 &&
      item <= maxSlotIndex,
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

  const session = auth.session;
  const isColorful = parseBookFlow(session.bookFlow) === "colorful";
  const maxSlotIndex = Math.max(0, session.slots.length - 1);
  const defaultIndexes = session.slots.map((_, index) => index);
  const slotIndexes =
    parseSlotIndexes(body.slotIndexes, maxSlotIndex) ?? defaultIndexes;
  const allStylesForSlot = body.allStylesForSlot === true && !isColorful;

  if (session.phase === "cart_added") {
    return NextResponse.json(
      { error: "Color preview is not available after cart submission" },
      { status: 409 },
    );
  }

  // Classic color generation starts only after approve-bw (server pipeline).
  // Allowing it during bw_review raced with that pipeline and doubled Gemini calls.
  if (session.phase === "bw_review" && !isColorful) {
    return NextResponse.json(
      { error: "Approve B&W before generating color" },
      { status: 409 },
    );
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

  const style = body.style ?? getDefaultColorStyle();
  const allowedStyles: StyleType[] = [...getPreviewColorStyles()];
  if (!allowedStyles.includes(style)) {
    return NextResponse.json({ error: "Invalid style" }, { status: 400 });
  }

  // Never start a second color run while the pipeline still owns these slots.
  // Per-slot Redis claims in the runner are the money lock; this is a fast no-op.
  const anyTargetInFlight = slotIndexes.some(
    (index) => session.slots[index]?.colorInFlight,
  );
  if (anyTargetInFlight) {
    return NextResponse.json({ session: toPublicView(session) });
  }

  session.selectedColorStyle = style;
  await savePreviewSession(session);

  const updated = await runColorGeneration(sessionId, style, slotIndexes);
  if (!updated) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session: toPublicView(updated) });
}
