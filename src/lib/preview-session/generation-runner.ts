import { randomUUID } from "crypto";
import { nextBwVersion } from "./cloudinary-paths";
import { uploadCleanAndWatermarkedOutputs } from "./upload-preview-outputs";
import { generateBwImageBuffer, toGenerationError } from "./generate-bw";
import {
  bwGenerationClaimKey,
  releaseGenerationClaim,
  tryClaimGeneration,
} from "./generation-claim";
import {
  logPreviewGenerationFailure,
  logPreviewGenerationSuccess,
  logPreviewGenerationSummary,
  type PreviewGenerationContext,
  type PreviewGenerationTrigger,
} from "./generation-log";
import { maybeLogProhibitedContentEvent } from "./prohibited-content-log";
import { analyticsContextFromSession } from "@/lib/analytics-context";
import { trackGenerationStepDuration } from "@/lib/analytics-server";
import { loadPreviewSession, savePreviewSession } from "./store";
import type { PreviewCandidate, PreviewSession } from "./types";

function slotHasSuccessfulBwForSource(
  slot: PreviewSession["slots"][number],
  sourceUrl: string,
): boolean {
  return slot.candidates.some(
    (candidate) =>
      candidate.kind === "bw" &&
      candidate.sourceUrl === sourceUrl &&
      Boolean(candidate.previewUrl) &&
      !candidate.error,
  );
}

function getSuccessfulBwForSource(
  slot: PreviewSession["slots"][number],
  sourceUrl: string,
): PreviewCandidate | undefined {
  return slot.candidates.find(
    (candidate) =>
      candidate.kind === "bw" &&
      candidate.sourceUrl === sourceUrl &&
      Boolean(candidate.previewUrl) &&
      !candidate.error,
  );
}

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

  // Intentional new versions (regen/replace) always claim a fresh run.
  // Initial path should never re-bill if success already exists.
  if (trigger === "initial" && slotHasSuccessfulBwForSource(slot, sourceUrl)) {
    const existing = getSuccessfulBwForSource(slot, sourceUrl);
    if (existing) {
      slot.activeCandidateId = existing.id;
      slot.inFlight = false;
      await savePreviewSession(session);
      return session;
    }
  }

  const claimKey = bwGenerationClaimKey(session.id, slotIndex, sourceUrl);
  if (trigger === "initial") {
    const claimed = await tryClaimGeneration(claimKey);
    if (!claimed) {
      slot.inFlight = false;
      await savePreviewSession(session);
      return session;
    }
  }

  slot.inFlight = true;
  await savePreviewSession(session);

  const startedAt = Date.now();
  try {
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
        context: analyticsContextFromSession(session),
      });
    }

    return session;
  } finally {
    if (trigger === "initial") {
      await releaseGenerationClaim(claimKey);
    }
  }
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
    session.slots.map(async (slot, index) => {
      const sourceUrl = slot.originalUrl;
      if (!sourceUrl) {
        return null;
      }

      // Already have a successful B&W for this source — never call Gemini again.
      if (slotHasSuccessfulBwForSource(slot, sourceUrl)) {
        return getSuccessfulBwForSource(slot, sourceUrl) ?? null;
      }

      const claimKey = bwGenerationClaimKey(sessionId, index, sourceUrl);
      const claimed = await tryClaimGeneration(claimKey);
      if (!claimed) {
        // Another worker owns this slot; do not bill again.
        return null;
      }

      try {
        // Re-check after claim in case the other worker finished between checks.
        const fresh = await loadPreviewSession(sessionId);
        const freshSlot = fresh?.slots[index];
        if (
          freshSlot &&
          slotHasSuccessfulBwForSource(freshSlot, sourceUrl)
        ) {
          return getSuccessfulBwForSource(freshSlot, sourceUrl) ?? null;
        }

        const version = nextBwVersion(slot);
        return await buildCandidate(
          sessionId,
          index,
          sourceUrl,
          version,
          "initial",
        );
      } finally {
        await releaseGenerationClaim(claimKey);
      }
    }),
  );

  const latest = await loadPreviewSession(sessionId);
  if (!latest) return null;

  const newlyGenerated: PreviewCandidate[] = [];
  latest.slots = latest.slots.map((slot, index) => {
    const candidate = results[index];
    if (!candidate) {
      return {
        ...slot,
        inFlight: false,
        pendingIdempotencyKey: undefined,
      };
    }

    const alreadyHave = slotHasSuccessfulBwForSource(slot, candidate.sourceUrl);
    if (alreadyHave) {
      const existing = getSuccessfulBwForSource(slot, candidate.sourceUrl);
      return {
        ...slot,
        activeCandidateId: existing?.id ?? slot.activeCandidateId,
        inFlight: false,
        pendingIdempotencyKey: undefined,
      };
    }

    newlyGenerated.push(candidate);
    return {
      ...slot,
      candidates: [...slot.candidates, candidate],
      activeCandidateId: candidate.id,
      nextBwVersion: (candidate.version ?? 0) + 1,
      inFlight: false,
      pendingIdempotencyKey: undefined,
    };
  });

  const billedResults = results.filter(
    (candidate): candidate is PreviewCandidate => Boolean(candidate),
  );
  const succeeded = billedResults.filter((candidate) => candidate.previewUrl).length;
  const failed = billedResults.filter((candidate) => candidate.error).length;
  logPreviewGenerationSummary(
    "bw",
    {
      sessionId,
      succeeded,
      failed,
      total: billedResults.length,
      trigger: "initial",
    },
    { sessionId, trigger: "initial", side: "bw" },
  );
  if (newlyGenerated.length > 0) {
    trackGenerationStepDuration({
      generation_type: "booklet_bw",
      startedAt,
      results: newlyGenerated,
      context: analyticsContextFromSession(latest),
    });
  }
  await savePreviewSession(latest);
  return latest;
}
