import { randomUUID } from "crypto";
import { uploadBufferToCloudinary } from "./cloudinary";
import { generateBwImageBuffer, toGenerationError } from "./generate-bw";
import { loadPreviewSession, savePreviewSession } from "./store";
import type { PreviewCandidate, PreviewSession } from "./types";
import { applyPreviewWatermark } from "./watermark";

async function buildCandidate(
  sessionId: string,
  slotIndex: number,
  sourceUrl: string,
): Promise<PreviewCandidate> {
  const candidateId = randomUUID();
  const candidate: PreviewCandidate = {
    id: candidateId,
    kind: "bw",
    sourceUrl,
    createdAt: new Date().toISOString(),
  };

  try {
    const cleanBuffer = await generateBwImageBuffer(sourceUrl);
    const cleanUrl = await uploadBufferToCloudinary(
      cleanBuffer,
      "little-gali/preview/clean",
      `${sessionId}-${slotIndex}-${candidateId}`,
    );
    const watermarkedBuffer = await applyPreviewWatermark(cleanBuffer);
    const previewUrl = await uploadBufferToCloudinary(
      watermarkedBuffer,
      "little-gali/preview/watermarked",
      `${sessionId}-${slotIndex}-${candidateId}-wm`,
    );
    candidate.cleanUrl = cleanUrl;
    candidate.previewUrl = previewUrl;
  } catch (error) {
    candidate.error = toGenerationError(error);
  }

  return candidate;
}

export async function runSlotGeneration(
  session: PreviewSession,
  slotIndex: number,
  sourceUrl: string,
): Promise<PreviewSession> {
  const slot = session.slots[slotIndex];
  if (!slot) {
    throw new Error("Invalid slot index");
  }

  slot.inFlight = true;
  await savePreviewSession(session);

  const candidate = await buildCandidate(session.id, slotIndex, sourceUrl);
  slot.candidates.push(candidate);
  slot.activeCandidateId = candidate.id;
  slot.inFlight = false;
  slot.pendingIdempotencyKey = undefined;
  await savePreviewSession(session);
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

  const results = await Promise.all(
    session.slots.map((slot, index) =>
      buildCandidate(sessionId, index, slot.originalUrl),
    ),
  );

  const latest = await loadPreviewSession(sessionId);
  if (!latest) return null;

  latest.slots = latest.slots.map((slot, index) => {
    const candidate = results[index];
    return {
      ...slot,
      candidates: [...slot.candidates, candidate],
      activeCandidateId: candidate.id,
      inFlight: false,
      pendingIdempotencyKey: undefined,
    };
  });
  await savePreviewSession(latest);
  return latest;
}
