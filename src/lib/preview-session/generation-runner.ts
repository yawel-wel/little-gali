import { randomUUID } from "crypto";
import { nextBwVersion } from "./cloudinary-paths";
import { uploadCleanAndWatermarkedOutputs } from "./upload-preview-outputs";
import { generateBwImageBuffer, toGenerationError } from "./generate-bw";
import {
  logPreviewGenerationFailure,
  logPreviewGenerationSuccess,
  logPreviewGenerationSummary,
  type PreviewGenerationContext,
  type PreviewGenerationTrigger,
} from "./generation-log";
import { maybeLogProhibitedContentEvent } from "./prohibited-content-log";
import { trackGenerationStepDuration } from "@/lib/analytics-server";
import { loadPreviewSession, savePreviewSession } from "./store";
import type { PreviewCandidate, PreviewSession } from "./types";

async function buildCandidate(
  sessionId: string,
  slotIndex: number,
  sourceUrl: string,
  version: number,
  trigger: PreviewGenerationTrigger,
): Promise<PreviewCandidate> {
  const generationContext: PreviewGenerationContext = {
    sessionId,
    slot: slotIndex,
    trigger,
    side: "bw",
  };
  const candidateId = randomUUID();
  const candidate: PreviewCandidate = {
    id: candidateId,
    kind: "bw",
    sourceUrl,
    version,
    createdAt: new Date().toISOString(),
  };

  try {
    const cleanBuffer = await generateBwImageBuffer(sourceUrl, generationContext);
    const { cleanUpload, previewUpload } = await uploadCleanAndWatermarkedOutputs(
      cleanBuffer,
      sessionId,
      "bw",
      slotIndex,
      version,
    );
    candidate.cleanUrl = cleanUpload.secureUrl;
    candidate.cleanPublicId = cleanUpload.publicId;
    candidate.previewUrl = previewUpload.secureUrl;
    candidate.previewPublicId = previewUpload.publicId;
    logPreviewGenerationSuccess(
      "bw",
      {
        sessionId,
        slot: slotIndex,
        candidateId,
        trigger,
      },
      generationContext,
    );
  } catch (error) {
    candidate.error = toGenerationError(error);
    logPreviewGenerationFailure(
      "bw",
      {
        sessionId,
        slot: slotIndex,
        candidateId,
        code: candidate.error.code,
        trigger,
      },
      error,
      generationContext,
    );
    maybeLogProhibitedContentEvent({
      sessionId,
      slotIndex,
      side: "bw",
      candidateId,
      sourceUrl,
      trigger,
      error,
      errorCode: candidate.error.code,
    });
  }

  return candidate;
}

export async function runSlotGeneration(
  session: PreviewSession,
  slotIndex: number,
  sourceUrl: string,
  options?: { trigger?: PreviewGenerationTrigger },
): Promise<PreviewSession> {
  const trigger = options?.trigger ?? "initial";
  const slot = session.slots[slotIndex];
  if (!slot) {
    throw new Error("Invalid slot index");
  }

  slot.inFlight = true;
  await savePreviewSession(session);

  const startedAt = Date.now();
  const version = nextBwVersion(slot);
  const candidate = await buildCandidate(
    session.id,
    slotIndex,
    sourceUrl,
    version,
    trigger,
  );
  slot.candidates.push(candidate);
  slot.activeCandidateId = candidate.id;
  slot.nextBwVersion = version + 1;
  slot.inFlight = false;
  slot.pendingIdempotencyKey = undefined;
  await savePreviewSession(session);

  if (trigger !== "initial") {
    trackGenerationStepDuration({
      generation_type: "booklet_regen",
      startedAt,
      results: [candidate],
    });
  }

  return session;
}

export async function runInitialParallelGeneration(
  sessionId: string,
): Promise<PreviewSession | null> {
  const session = await loadPreviewSession(sessionId);
  if (!session) return null;

  session.slots = session.slots.map((slot) => ({
    ...slot,
    inFlight: true,
  }));
  await savePreviewSession(session);

  const startedAt = Date.now();
  const results = await Promise.all(
    session.slots.map((slot, index) => {
      const version = nextBwVersion(slot);
      return buildCandidate(sessionId, index, slot.originalUrl, version, "initial");
    }),
  );

  const latest = await loadPreviewSession(sessionId);
  if (!latest) return null;

  latest.slots = latest.slots.map((slot, index) => {
    const candidate = results[index];
    return {
      ...slot,
      candidates: [...slot.candidates, candidate],
      activeCandidateId: candidate.id,
      nextBwVersion: (candidate.version ?? 0) + 1,
      inFlight: false,
      pendingIdempotencyKey: undefined,
    };
  });
  const succeeded = results.filter((candidate) => candidate.previewUrl).length;
  const failed = results.filter((candidate) => candidate.error).length;
  logPreviewGenerationSummary(
    "bw",
    {
      sessionId,
      succeeded,
      failed,
      total: results.length,
      trigger: "initial",
    },
    { sessionId, trigger: "initial", side: "bw" },
  );
  trackGenerationStepDuration({
    generation_type: "booklet_bw",
    startedAt,
    results,
  });
  await savePreviewSession(latest);
  return latest;
}
