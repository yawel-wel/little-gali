import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { isAllowedUploadImageType } from "@/lib/allowed-image-types";
import { assertGenerationRateLimit } from "@/lib/rate-limit/generation-limiter";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import {
  copyCloudinaryUrlToPublicId,
  isAllowedCloudinaryUrl,
  overwriteCloudinaryAsset,
  uploadFileToCloudinaryPublicId,
} from "@/lib/preview-session/cloudinary";
import {
  inputPublicId,
  replacedInputPublicId,
} from "@/lib/preview-session/cloudinary-paths";
import {
  readIdempotentResponse,
  writeIdempotentResponse,
} from "@/lib/preview-session/idempotency";
import { logPreviewImageReplaced } from "@/lib/preview-session/generation-log";
import {
  consumeChangeCreditForResult,
  hasChangeCredits,
  slotHasProhibitedContentForReplace,
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

  const contentType = request.headers.get("content-type") ?? "";
  let slotIndex: number | undefined;
  let originalUrl: string | undefined;
  let replacementFile: File | undefined;
  let idempotencyKey: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const slotIndexValue = formData.get("slotIndex");
    slotIndex =
      typeof slotIndexValue === "string" ? Number(slotIndexValue) : undefined;
    const fileValue = formData.get("image");
    replacementFile = fileValue instanceof File ? fileValue : undefined;
    const idempotencyValue = formData.get("idempotencyKey");
    idempotencyKey =
      typeof idempotencyValue === "string" ? idempotencyValue : undefined;
  } else {
    const body = (await request.json()) as {
      slotIndex?: number;
      originalUrl?: string;
      idempotencyKey?: string;
    };
    slotIndex = body.slotIndex;
    originalUrl = body.originalUrl;
    idempotencyKey = body.idempotencyKey;
  }

  if (
    typeof slotIndex !== "number" ||
    slotIndex < 0 ||
    slotIndex > 4 ||
    (!originalUrl && !replacementFile) ||
    !idempotencyKey
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (originalUrl && !isAllowedCloudinaryUrl(originalUrl)) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  if (replacementFile && !isAllowedUploadImageType(replacementFile)) {
    return NextResponse.json(
      { error: "Only JPG and PNG images are allowed" },
      { status: 400 },
    );
  }

  const cached = await readIdempotentResponse(sessionId, idempotencyKey);
  if (cached) {
    return NextResponse.json({ session: cached });
  }

  const session = auth.session;
  const fixingProhibited = slotHasProhibitedContentForReplace(
    session,
    slotIndex,
    session.selectedColorStyle,
  );

  if (!fixingProhibited && session.phase !== "bw_review") {
    return NextResponse.json({ error: "Session is not in B&W review" }, { status: 409 });
  }

  if (!fixingProhibited && !hasChangeCredits(session)) {
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
  const slotTag = String(slotIndex);
  const startedAt = Date.now();
  Sentry.metrics.count("image_replacement_started", 1, {
    attributes: { sessionId, slot: slotTag },
  });
  logPreviewApiOperation("image_replacement", "started", {
    sessionId,
    slot: slotIndex,
    trigger: "replace",
    side: "bw",
  });

  try {
    const currentInputVersion = slot.inputVersion ?? 1;
    if (slot.originalUrl) {
      await copyCloudinaryUrlToPublicId(
        slot.originalUrl,
        replacedInputPublicId(sessionId, slotIndex, currentInputVersion),
      );
    }

    const nextInputVersion = slot.originalUrl ? currentInputVersion + 1 : 1;
    const targetPublicId = inputPublicId(sessionId, slotIndex);
    const inputUpload = replacementFile
      ? await overwriteCloudinaryAsset(replacementFile, targetPublicId)
      : await copyCloudinaryUrlToPublicId(
          originalUrl as string,
          targetPublicId,
        );

    slot.originalUrl = inputUpload.secureUrl;
    slot.originalPublicId = inputUpload.publicId;
    slot.inputVersion = nextInputVersion;
    slot.candidates = [];
    slot.activeCandidateId = undefined;
    slot.pendingIdempotencyKey = idempotencyKey;
    await savePreviewSession(session);

    const updated = await runSlotGeneration(session, slotIndex, inputUpload.secureUrl, {
      trigger: "replace",
    });
    const activeSlot = updated.slots[slotIndex];
    const activeCandidate = activeSlot?.candidates.find(
      (candidate) =>
        candidate.kind === "bw" && candidate.id === activeSlot.activeCandidateId,
    );

    if (!fixingProhibited) {
      consumeChangeCreditForResult(updated, activeCandidate?.error);
    }
    await savePreviewSession(updated);

    if (activeCandidate?.previewUrl) {
      logPreviewImageReplaced({
        sessionId,
        slot: slotIndex,
        inputVersion: activeSlot?.inputVersion,
        candidateId: activeCandidate.id,
      });
    }
    const view = toPublicView(updated);
    await writeIdempotentResponse(sessionId, idempotencyKey, view);

    const durationMs = Date.now() - startedAt;
    logPreviewApiOperation(
      "image_replacement",
      "completed",
      { sessionId, slot: slotIndex, trigger: "replace", side: "bw" },
      {
        durationMs,
        generationSucceeded: Boolean(activeCandidate?.previewUrl),
        errorCode: activeCandidate?.error?.code,
      },
    );
    Sentry.metrics.count("image_replacement_completed", 1, {
      attributes: { sessionId, slot: slotTag },
    });
    Sentry.metrics.distribution("image_replacement_duration_ms", durationMs, {
      attributes: { sessionId },
    });

    return NextResponse.json({ session: view });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const errorMessage = error instanceof Error ? error.message : String(error);
    logPreviewApiOperation(
      "image_replacement",
      "failed",
      { sessionId, slot: slotIndex, trigger: "replace", side: "bw" },
      { durationMs, errorMessage },
    );
    Sentry.captureException(error, {
      tags: { sessionId, slot: slotTag, event: "image_replacement_failed" },
      extra: { sessionId, slot: slotTag, durationMs },
    });
    Sentry.metrics.count("image_replacement_failed", 1, {
      attributes: { sessionId, slot: slotTag },
    });
    throw error;
  }
}
