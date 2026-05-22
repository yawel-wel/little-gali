import {
  copyCloudinaryUrlToPublicId,
  uploadFileToCloudinaryPublicId,
} from "./cloudinary";
import { inputPublicId } from "./cloudinary-paths";
import { runInitialParallelColorBundle } from "./color-generation-runner";
import { runInitialParallelGeneration } from "./generation-runner";
import { loadPreviewSession, savePreviewSession } from "./store";
import type { PreviewSession, PreviewSlot } from "./types";
import { allSlotsHaveColorForStyle } from "./color-by-style";

export interface PendingUpload {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
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
  const allPencilDone = allSlotsHaveColorForStyle(session, "pencil");
  if (allPencilDone) {
    session.generationStatus = "complete";
    session.initializationError = undefined;
  }
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
}

async function applyOriginalUploads(
  sessionId: string,
  originalUrls: Array<{ secureUrl: string; publicId: string }>,
): Promise<void> {
  const session = await loadPreviewSession(sessionId);
  if (!session) {
    throw new Error("Preview session not found");
  }

  session.slots = session.slots.map((slot, index) => ({
    ...slot,
    originalUrl: originalUrls[index]?.secureUrl ?? slot.originalUrl,
    originalPublicId: originalUrls[index]?.publicId ?? slot.originalPublicId,
    inputVersion: 1,
    inFlight: true,
    colorInFlight: false,
    candidates: [],
    activeCandidateId: undefined,
    colorCandidates: [],
    colorPreview: undefined,
  }));
  session.generationStatus = "running";
  session.initializationError = undefined;
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
  await runInitialParallelGeneration(sessionId);

  const session = await loadPreviewSession(sessionId);
  if (!session) return;
  syncGenerationStatus(session);
  if (session.generationStatus !== "complete") {
    session.generationStatus = "failed";
    session.initializationError =
      session.initializationError ?? "Preview generation did not complete";
  }
  await savePreviewSession(session);
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
  await runInitialParallelGeneration(sessionId);

  const session = await loadPreviewSession(sessionId);
  if (!session) return;
  syncGenerationStatus(session);
  if (session.generationStatus !== "complete") {
    session.generationStatus = "failed";
    session.initializationError =
      session.initializationError ?? "Preview generation did not complete";
  }
  await savePreviewSession(session);
}

export async function runColorPipelineForApprovedSession(
  sessionId: string,
): Promise<void> {
  await runInitialParallelColorBundle(sessionId);

  const session = await loadPreviewSession(sessionId);
  if (!session) return;
  syncColorGenerationStatus(session);
  if (session.generationStatus !== "complete") {
    session.generationStatus = "failed";
    session.initializationError =
      session.initializationError ?? "Color generation did not complete";
  }
  session.slots = session.slots.map((slot) => ({
    ...slot,
    colorInFlight: false,
  }));
  await savePreviewSession(session);
}
