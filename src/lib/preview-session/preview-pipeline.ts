import { analyticsContextFromSession } from "@/lib/analytics-context";
import { trackServerError } from "@/lib/analytics-server";
import type { StyleType } from "@/components/style-selector";
import {
  allSlotsHaveColorForStyle,
  getDefaultColorStyle,
  getColorCandidateForStyle,
  syncColorPreviewToStyle,
} from "./color-by-style";
import {
  approveBwClaimKey,
  generateBwClaimKey,
  pipelineScheduleClaimKey,
  PIPELINE_CLAIM_TTL_SECONDS,
  releaseGenerationClaim,
  tryClaimGeneration,
} from "./generation-claim";
import {
  copyCloudinaryUrlToPublicId,
  uploadFileToCloudinaryPublicId,
} from "./cloudinary";
import { inputPublicId } from "./cloudinary-paths";
import {
  runColorfulBookColorGeneration,
  runInitialParallelColorBundle,
} from "./color-generation-runner";
import { parseBookFlow } from "./book-flow";
import { runInitialParallelGeneration } from "./generation-runner";
import {
  logPreviewColorPipelineIncomplete,
  logPreviewColorPipelineRecovered,
  logPreviewPipelineBackgroundFailed,
  type ColorPipelineSlotDiagnostic,
} from "./generation-log";
import { loadPreviewSession, savePreviewSession, slotHasSuccessfulBw } from "./store";
import type { PreviewSession } from "./types";

export interface PendingUpload {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}

const COLOR_PIPELINE_RELOAD_ATTEMPTS = 3;
const COLOR_PIPELINE_RELOAD_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function syncColorGenerationStatus(session: PreviewSession): void {
  const defaultColorReady = allSlotsHaveColorForStyle(
    session,
    getDefaultColorStyle(),
  );
  if (defaultColorReady) {
    session.generationStatus = "complete";
    session.initializationError = undefined;
  }
}

function collectColorPipelineSlotDiagnostics(
  session: PreviewSession,
  style: StyleType,
): ColorPipelineSlotDiagnostic[] {
  return session.slots.map((slot, index) => {
    const candidate = getColorCandidateForStyle(slot, style);
    const colorCandidateCount =
      slot.colorCandidates?.filter(
        (item) =>
          item.kind === "color" && (item.style ?? "pencil") === style,
      ).length ?? 0;
    return {
      slot: index,
      hasPreviewUrl: Boolean(candidate?.previewUrl),
      hasError: Boolean(candidate?.error),
      colorCandidateCount,
    };
  });
}

async function finalizeColorPipelineSession(
  sessionId: string,
): Promise<PreviewSession | null> {
  let session = await loadPreviewSession(sessionId);
  if (!session) {
    return null;
  }

  for (let attempt = 0; attempt < COLOR_PIPELINE_RELOAD_ATTEMPTS; attempt += 1) {
    syncColorPreviewToStyle(session, getDefaultColorStyle());
    syncColorGenerationStatus(session);
    if (session.generationStatus === "complete") {
      if (attempt > 0) {
        logPreviewColorPipelineRecovered(sessionId, attempt);
      }
      return session;
    }
    if (attempt < COLOR_PIPELINE_RELOAD_ATTEMPTS - 1) {
      await delay(COLOR_PIPELINE_RELOAD_DELAY_MS);
      const reloaded = await loadPreviewSession(sessionId);
      if (!reloaded) {
        return null;
      }
      session = reloaded;
    }
  }

  return session;
}

export async function markSessionPipelineFailed(
  sessionId: string,
  error: unknown,
): Promise<void> {
  const session = await loadPreviewSession(sessionId);
  if (!session) return;

  const message =
    error instanceof Error
      ? error.message
      : "Preview initialization failed";
  session.generationStatus = "failed";
  session.initializationError = message;
  session.slots = session.slots.map((slot) => ({
    ...slot,
    inFlight: false,
    colorInFlight: false,
  }));
  await savePreviewSession(session);
  await Promise.all([
    releaseGenerationClaim(pipelineScheduleClaimKey(sessionId)),
    releaseGenerationClaim(approveBwClaimKey(sessionId)),
    releaseGenerationClaim(generateBwClaimKey(sessionId)),
  ]);
  trackServerError(
    {
      step: "booklet_generation",
      error_message: message,
      session_id: sessionId,
    },
    analyticsContextFromSession(session),
  );
}

async function applyOriginalUploads(
  sessionId: string,
  originalUrls: Array<{ secureUrl: string; publicId: string }>,
): Promise<void> {
  const session = await loadPreviewSession(sessionId);
  if (!session) {
    throw new Error("Preview session not found");
  }

  const isColorful = parseBookFlow(session.bookFlow) === "colorful";

  session.slots = session.slots.map((slot, index) => ({
    ...slot,
    originalUrl: originalUrls[index]?.secureUrl ?? slot.originalUrl,
    originalPublicId: originalUrls[index]?.publicId ?? slot.originalPublicId,
    inputVersion: 1,
    inFlight: false,
    colorInFlight: true,
    candidates: [],
    activeCandidateId: undefined,
    colorCandidates: [],
    colorPreview: undefined,
  }));
  session.generationStatus = "running";
  session.initializationError = undefined;
  session.phase = "bw_approved";
  if (isColorful || !session.selectedColorStyle) {
    session.selectedColorStyle = getDefaultColorStyle();
  }
  await savePreviewSession(session);
}

async function finalizeAfterInitialPipeline(sessionId: string): Promise<void> {
  const session = await loadPreviewSession(sessionId);
  if (!session) return;

  syncColorPreviewToStyle(session, getDefaultColorStyle());
  const colorReady = allSlotsHaveColorForStyle(
    session,
    getDefaultColorStyle(),
  );
  if (colorReady) {
    session.generationStatus = "complete";
    session.initializationError = undefined;
  } else {
    session.generationStatus = "failed";
    session.initializationError =
      session.initializationError ?? "Preview generation did not complete";
  }
  await savePreviewSession(session);
  await releaseGenerationClaim(pipelineScheduleClaimKey(sessionId));
}

export async function runPreviewPipelineFromMultipart(
  sessionId: string,
  uploads: PendingUpload[],
): Promise<void> {
  const originalUrls = await Promise.all(
    uploads.map((upload, index) => {
      const bytes = Uint8Array.from(upload.buffer);
      const file = new File([bytes], upload.fileName, {
        type: upload.mimeType,
      });
      return uploadFileToCloudinaryPublicId(file, inputPublicId(sessionId, index));
    }),
  );

  await applyOriginalUploads(sessionId, originalUrls);

  const session = await loadPreviewSession(sessionId);
  if (!session) return;

  if (parseBookFlow(session.bookFlow) === "colorful") {
    await runColorfulBookColorGeneration(sessionId);
  } else {
    await runColorPipelineForApprovedSession(sessionId);
  }

  await finalizeAfterInitialPipeline(sessionId);
}

export async function runPreviewPipelineFromRemoteUrls(
  sessionId: string,
  sourceUrls: string[],
): Promise<void> {
  const originalUrls = await Promise.all(
    sourceUrls.map((url, index) =>
      copyCloudinaryUrlToPublicId(url, inputPublicId(sessionId, index)),
    ),
  );

  await applyOriginalUploads(sessionId, originalUrls);

  const session = await loadPreviewSession(sessionId);
  if (!session) return;

  if (parseBookFlow(session.bookFlow) === "colorful") {
    await runColorfulBookColorGeneration(sessionId);
  } else {
    await runColorPipelineForApprovedSession(sessionId);
  }

  await finalizeAfterInitialPipeline(sessionId);
}

export async function runColorPipelineForApprovedSession(
  sessionId: string,
): Promise<void> {
  await runInitialParallelColorBundle(sessionId);

  const session = await finalizeColorPipelineSession(sessionId);
  if (!session) return;

  if (session.generationStatus !== "complete") {
    const message =
      session.initializationError ?? "Color generation did not complete";
    session.generationStatus = "failed";
    session.initializationError = message;
    logPreviewColorPipelineIncomplete(sessionId, {
      style: getDefaultColorStyle(),
      phase: session.phase,
      slots: collectColorPipelineSlotDiagnostics(session, getDefaultColorStyle()),
      colorInFlightCount: session.slots.filter((slot) => slot.colorInFlight)
        .length,
      reloadAttempts: COLOR_PIPELINE_RELOAD_ATTEMPTS,
    });
    trackServerError(
      {
        step: "booklet_color_generation",
        error_message: message,
        session_id: sessionId,
      },
      analyticsContextFromSession(session),
    );
  }

  session.slots = session.slots.map((slot) => ({
    ...slot,
    colorInFlight: false,
  }));
  await savePreviewSession(session);
  await releaseGenerationClaim(approveBwClaimKey(sessionId));
}

/**
 * Leftover classic sessions that were created in the old B&W-first flow.
 * Advance them into the color-first UI without starting extra B&W work.
 */
export async function maybeMigrateLegacyClassicBwReview(
  session: PreviewSession,
): Promise<{ session: PreviewSession; scheduledColor: boolean }> {
  if (parseBookFlow(session.bookFlow) !== "classic") {
    return { session, scheduledColor: false };
  }
  if (session.phase !== "bw_review") {
    return { session, scheduledColor: false };
  }

  session.phase = "bw_approved";
  if (!session.selectedColorStyle) {
    session.selectedColorStyle = getDefaultColorStyle();
  }

  const colorReady = allSlotsHaveColorForStyle(
    session,
    getDefaultColorStyle(),
  );
  const colorInFlight = session.slots.some((slot) => slot.colorInFlight);

  if (colorReady || colorInFlight) {
    await savePreviewSession(session);
    return { session, scheduledColor: false };
  }

  const claimed = await tryClaimGeneration(
    approveBwClaimKey(session.id),
    PIPELINE_CLAIM_TTL_SECONDS,
  );
  if (!claimed) {
    const latest = await loadPreviewSession(session.id);
    return { session: latest ?? session, scheduledColor: false };
  }

  session.generationStatus = "running";
  session.slots = session.slots.map((slot) => ({
    ...slot,
    colorInFlight: true,
  }));
  await savePreviewSession(session);
  return { session, scheduledColor: true };
}

/**
 * Starts classic B&W generation only after an explicit user action.
 * Does not change generationStatus (that flag drives the color loading screen).
 */
export async function startClassicBwGeneration(
  session: PreviewSession,
): Promise<{ session: PreviewSession; scheduled: boolean }> {
  if (parseBookFlow(session.bookFlow) !== "classic") {
    return { session, scheduled: false };
  }
  if (session.phase === "cart_added" || session.phase === "bw_review") {
    return { session, scheduled: false };
  }

  const colorReady = allSlotsHaveColorForStyle(
    session,
    session.selectedColorStyle ?? getDefaultColorStyle(),
  );
  if (!colorReady) {
    return { session, scheduled: false };
  }

  const pendingIndexes = session.slots
    .map((slot, index) => ({ slot, index }))
    .filter(({ slot }) => !slotHasSuccessfulBw(slot) && !slot.inFlight)
    .map(({ index }) => index);

  if (pendingIndexes.length === 0) {
    return { session, scheduled: false };
  }

  const claimed = await tryClaimGeneration(
    generateBwClaimKey(session.id),
    PIPELINE_CLAIM_TTL_SECONDS,
  );
  if (!claimed) {
    return { session, scheduled: false };
  }

  const pending = new Set(pendingIndexes);
  session.slots = session.slots.map((slot, index) =>
    pending.has(index) ? { ...slot, inFlight: true } : slot,
  );
  await savePreviewSession(session);
  return { session, scheduled: true };
}

export async function runClassicBwPipelineForSession(
  sessionId: string,
): Promise<void> {
  try {
    await runInitialParallelGeneration(sessionId);
  } catch (error) {
    console.error("Background B&W pipeline failed:", sessionId, error);
    logPreviewPipelineBackgroundFailed(sessionId, "bw", error);
  } finally {
    const latest = await loadPreviewSession(sessionId);
    if (latest) {
      latest.slots = latest.slots.map((slot) => ({
        ...slot,
        inFlight: false,
      }));
      await savePreviewSession(latest);
    }
    await releaseGenerationClaim(generateBwClaimKey(sessionId));
  }
}
