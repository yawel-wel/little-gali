import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import type { StyleType } from "@/components/style-selector";
import { assertGenerationRateLimit } from "@/lib/rate-limit/generation-limiter";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { runSlotColorGeneration } from "@/lib/preview-session/color-generation-runner";
import { logPreviewApiOperation } from "@/lib/preview-session/generation-log";
import {
  consumeChangeCreditForResult,
  hasChangeCredits,
} from "@/lib/preview-session/credits";
import { slotColorActiveHasRetryableError } from "@/lib/preview-session/retryable-slot-error";
import { savePreviewSession, toPublicView } from "@/lib/preview-session/store";

export const runtime = "nodejs";
export const maxDuration = 120;

const STYLES: StyleType[] = ["cartoon", "pencil", "watercolor"];

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
    slotIndex?: number;
    style?: StyleType;
    freeRetry?: boolean;
  };
  const { slotIndex } = body;
  const style = body.style ?? auth.session.selectedColorStyle ?? "pencil";
  const requestedFreeRetry = body.freeRetry === true;

  if (
    typeof slotIndex !== "number" ||
    slotIndex < 0 ||
    slotIndex > 4 ||
    !STYLES.includes(style)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const session = auth.session;
  if (session.phase === "bw_review" || session.phase === "cart_added") {
    return NextResponse.json(
      { error: "Color regeneration is only available after B&W approval" },
      { status: 409 },
    );
  }

  const slot = session.slots[slotIndex];
  if (!slot || slot.colorInFlight) {
    return NextResponse.json({ error: "Slot is busy" }, { status: 409 });
  }

  const freeRetry =
    requestedFreeRetry && slotColorActiveHasRetryableError(slot, style);

  const active = slot.candidates.find(
    (candidate) =>
      candidate.kind === "bw" && candidate.id === slot.activeCandidateId,
  );
  if (!active?.previewUrl || active.error) {
    return NextResponse.json(
      { error: "B&W preview is not ready for color generation" },
      { status: 409 },
    );
  }

  if (!freeRetry && !hasChangeCredits(session)) {
    return NextResponse.json(
      { error: "No change credits remaining" },
      { status: 403 },
    );
  }

  Sentry.setUser({ id: sessionId });
  Sentry.setTag("sessionId", sessionId);
  const side = "color";
  const slotTag = String(slotIndex);
  const startedAt = Date.now();
  Sentry.metrics.count("image_regeneration_started", 1, {
    attributes: { sessionId, slot: slotTag, side },
  });
  logPreviewApiOperation("image_regeneration", "started", {
    sessionId,
    slot: slotIndex,
    side,
    trigger: "regenerate",
    style,
  });

  try {
    const updated = await runSlotColorGeneration(sessionId, slotIndex, style, {
      trigger: "regenerate",
    });
    if (!updated) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const activeSlot = updated.slots[slotIndex];
    const colorPreview = activeSlot?.colorPreview;
    if (!freeRetry) {
      consumeChangeCreditForResult(updated, colorPreview?.error);
    }
    await savePreviewSession(updated);
    const durationMs = Date.now() - startedAt;
    logPreviewApiOperation(
      "image_regeneration",
      "completed",
      { sessionId, slot: slotIndex, side, trigger: "regenerate", style },
      {
        durationMs,
        generationSucceeded: Boolean(colorPreview?.previewUrl),
        errorCode: colorPreview?.error?.code,
      },
    );
    Sentry.metrics.count("image_regeneration_completed", 1, {
      attributes: { sessionId, slot: slotTag, side },
    });
    Sentry.metrics.distribution("image_regeneration_duration_ms", durationMs, {
      attributes: { sessionId, side },
    });

    return NextResponse.json({ session: toPublicView(updated) });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const errorMessage = error instanceof Error ? error.message : String(error);
    logPreviewApiOperation(
      "image_regeneration",
      "failed",
      { sessionId, slot: slotIndex, side, trigger: "regenerate", style },
      { durationMs, errorMessage },
    );
    Sentry.captureException(error, {
      tags: { sessionId, slot: slotTag, side, event: "image_regeneration_failed" },
      extra: { sessionId, slot: slotTag, side, durationMs },
    });
    Sentry.metrics.count("image_regeneration_failed", 1, {
      attributes: { sessionId, slot: slotTag, side },
    });
    throw error;
  }
}
