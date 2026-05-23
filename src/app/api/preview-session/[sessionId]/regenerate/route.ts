import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { assertGenerationRateLimit } from "@/lib/rate-limit/generation-limiter";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import {
  readIdempotentResponse,
  writeIdempotentResponse,
} from "@/lib/preview-session/idempotency";
import {
  consumeChangeCreditForResult,
  hasChangeCredits,
} from "@/lib/preview-session/credits";
import { logPreviewApiOperation } from "@/lib/preview-session/generation-log";
import { runSlotGeneration } from "@/lib/preview-session/generation-runner";
import { savePreviewSession, toPublicView } from "@/lib/preview-session/store";

export const runtime = "nodejs";
export const maxDuration = 120;

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

  const body = (await request.json()) as {
    slotIndex?: number;
    idempotencyKey?: string;
  };
  const slotIndex = body.slotIndex;
  const idempotencyKey = body.idempotencyKey;

  if (
    typeof slotIndex !== "number" ||
    slotIndex < 0 ||
    slotIndex > 4 ||
    !idempotencyKey
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const cached = await readIdempotentResponse(sessionId, idempotencyKey);
  if (cached) {
    return NextResponse.json({ session: cached });
  }

  const session = auth.session;
  if (session.phase === "cart_added") {
    return NextResponse.json({ error: "Session is already in cart" }, { status: 409 });
  }

  if (!hasChangeCredits(session)) {
    return NextResponse.json(
      { error: "No change credits remaining" },
      { status: 403 },
    );
  }

  const slot = session.slots[slotIndex];
  if (!slot || slot.inFlight) {
    return NextResponse.json({ error: "Slot is busy" }, { status: 409 });
  }

  Sentry.setUser({ id: sessionId });
  Sentry.setTag("sessionId", sessionId);
  const side = "bw";
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
  });

  try {
    slot.pendingIdempotencyKey = idempotencyKey;
    await savePreviewSession(session);

    const updated = await runSlotGeneration(session, slotIndex, slot.originalUrl, {
      trigger: "regenerate",
    });
    const activeSlot = updated.slots[slotIndex];
    const activeCandidate = activeSlot?.candidates.find(
      (candidate) =>
        candidate.kind === "bw" && candidate.id === activeSlot.activeCandidateId,
    );
    consumeChangeCreditForResult(updated, activeCandidate?.error);
    await savePreviewSession(updated);
    const view = toPublicView(updated);
    await writeIdempotentResponse(sessionId, idempotencyKey, view);

    const durationMs = Date.now() - startedAt;
    logPreviewApiOperation(
      "image_regeneration",
      "completed",
      { sessionId, slot: slotIndex, side, trigger: "regenerate" },
      {
        durationMs,
        generationSucceeded: Boolean(activeCandidate?.previewUrl),
        errorCode: activeCandidate?.error?.code,
      },
    );
    Sentry.metrics.count("image_regeneration_completed", 1, {
      attributes: { sessionId, slot: slotTag, side },
    });
    Sentry.metrics.distribution("image_regeneration_duration_ms", durationMs, {
      attributes: { sessionId, side },
    });

    return NextResponse.json({ session: view });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const errorMessage = error instanceof Error ? error.message : String(error);
    logPreviewApiOperation(
      "image_regeneration",
      "failed",
      { sessionId, slot: slotIndex, side, trigger: "regenerate" },
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
