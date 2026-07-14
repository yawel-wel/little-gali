import { analyticsContextFromSession } from "@/lib/analytics-context";
import { trackServerError } from "@/lib/analytics-server";
import type { StyleType } from "@/components/style-selector";
import {
  allSlotsHaveColorForStyle,
  DEFAULT_COLOR_STYLE,
  getColorCandidateForStyle,
  syncColorPreviewToStyle,
} from "./color-by-style";
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
  type ColorPipelineSlotDiagnostic,
} from "./generation-log";
import { loadPreviewSession, savePreviewSession } from "./store";
import type { PreviewSession, PreviewSlot } from "./types";

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

function slotHasBwResult(slot: PreviewSlot): boolean {
  const active = slot.candidates.find(
    (candidate) =>
      candidate.kind === "bw" && candidate.id === slot.activeCandidateId,
  );
  return Boolean(active?.previewUrl || active?.error);
}

function slotHasColorResult(slot: PreviewSlot): boolean {
  return Boolean(slot.colorPreview?.previewUrl || slot.colorPreview?.error);
}

export function syncGenerationStatus(session: PreviewSession): void {
  const allBwDone = session.slots.every(slotHasBwResult);
  if (allBwDone) {
    session.generationStatus = "complete";
    session.initializationError = undefined;
  }
}

function syncColorGenerationStatus(session: PreviewSession): void {
  const defaultColorReady = allSlotsHaveColorForStyle(
    session,
    DEFAULT_COLOR_STYLE,
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
    syncColorPreviewToStyle(session, DEFAULT_COLOR_STYLE);
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
    inFlight: !isColorful,
    colorInFlight: isColorful,
    candidates: [],
    activeCandidateId: undefined,
    colorCandidates: [],
    colorPreview: undefined,
  }));
  session.generationStatus = "running";
  session.initializationError = undefined;
  if (isColorful) {
    session.phase = "bw_approved";
    session.selectedColorStyle = "colorful";
  }
  await savePreviewSession(session);
}

async function finalizeAfterInitialPipeline(sessionId: string): Promise<void> {
  const session = await loadPreviewSession(sessionId);
  if (!session) return;

  if (parseBookFlow(session.bookFlow) === "colorful") {
    syncColorPreviewToStyle(session, "colorful");
    const colorReady = allSlotsHaveColorForStyle(session, "colorful");
    if (colorReady) {
      session.generationStatus = "complete";
      session.initializationError = undefined;
    } else {
      session.generationStatus = "failed";
      session.initializationError =
        session.initializationError ?? "Preview generation did not complete";
    }
  } else {
    syncGenerationStatus(session);
    if (session.generationStatus !== "complete") {
      session.generationStatus = "failed";
      session.initializationError =
        session.initializationError ?? "Preview generation did not complete";
    }
  }
  await savePreviewSession(session);
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
    await runInitialParallelGeneration(sessionId);
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
    await runInitialParallelGeneration(sessionId);
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
      style: DEFAULT_COLOR_STYLE,
      phase: session.phase,
      slots: collectColorPipelineSlotDiagnostics(session, DEFAULT_COLOR_STYLE),
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
}
