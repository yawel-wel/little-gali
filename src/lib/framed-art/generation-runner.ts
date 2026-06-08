import { randomUUID } from "crypto";
import type { StyleType } from "@/components/style-selector";
import { generateColorImageBuffer } from "@/lib/preview-session/generate-color";
import { toGenerationError } from "@/lib/preview-session/generate-bw";
import { uploadFramedArtOutputs } from "./upload-outputs";
import {
  getCandidateForStyle,
  loadFramedArtSession,
  saveFramedArtSession,
  hasFramedArtPreviewReady,
  recoverStaleFramedArtInFlight,
} from "./store";
import type { FramedArtSession, FramedArtStyleCandidate } from "./types";
import { logPreviewGenerationFailure } from "@/lib/preview-session/generation-log";
import { maybeLogProhibitedContentEvent } from "@/lib/preview-session/prohibited-content-log";
import { trackGenerationDuration } from "@/lib/analytics-server";

async function buildFramedStyleCandidate(
  sessionId: string,
  sourceUrl: string,
  style: StyleType,
  version: number,
): Promise<FramedArtStyleCandidate> {
  const candidate: FramedArtStyleCandidate = {
    id: randomUUID(),
    style,
    sourceUrl,
    version,
    createdAt: new Date().toISOString(),
  };

  const startedAt = Date.now();

  try {
    const cleanBuffer = await generateColorImageBuffer(sourceUrl, style, {
      sessionId,
      slot: 0,
      trigger: version > 1 ? "regenerate" : "initial",
      side: "color",
    });

    const { cleanUpload, previewUpload } = await uploadFramedArtOutputs(
      cleanBuffer,
      sessionId,
      style,
      version,
    );

    candidate.cleanUrl = cleanUpload.secureUrl;
    candidate.cleanPublicId = cleanUpload.publicId;
    candidate.previewUrl = previewUpload.secureUrl;
    candidate.previewPublicId = previewUpload.publicId;
  } catch (error) {
    logPreviewGenerationFailure(
      "color",
      {
        sessionId,
        style,
        version,
        code: toGenerationError(error).code,
        trigger: version > 1 ? "regenerate" : "initial",
      },
      error,
      {
        sessionId,
        slot: 0,
        trigger: version > 1 ? "regenerate" : "initial",
        side: "color",
        style,
        candidateId: candidate.id,
      },
    );
    candidate.error = toGenerationError(error);
    maybeLogProhibitedContentEvent({
      sessionId,
      slotIndex: 0,
      side: "color",
      candidateId: candidate.id,
      sourceUrl,
      trigger: version > 1 ? "regenerate" : "initial",
      style,
      error,
      errorCode: candidate.error.code,
      productType: "frame",
    });
  } finally {
    trackGenerationDuration({
      generation_type: "frame",
      duration_seconds: (Date.now() - startedAt) / 1000,
      success: Boolean(candidate.cleanUrl),
    });
  }

  return candidate;
}

function nextVersionForStyle(
  session: FramedArtSession,
  style: StyleType,
): number {
  const existing = getCandidateForStyle(session, style);
  return (existing?.version ?? 0) + 1;
}

function upsertCandidate(
  session: FramedArtSession,
  candidate: FramedArtStyleCandidate,
): void {
  session.candidates = [
    ...session.candidates.filter((c) => c.style !== candidate.style),
    candidate,
  ];
}

export async function runFramedArtStyleGeneration(
  sessionId: string,
): Promise<FramedArtSession | null> {
  let session = await loadFramedArtSession(sessionId);
  if (!session?.selectedStyle) return null;

  session = await recoverStaleFramedArtInFlight(session);

  if (session.inFlight) {
    return session;
  }
  if (hasFramedArtPreviewReady(session)) {
    return session;
  }

  const style = session.selectedStyle;
  if (!style) return null;

  session.inFlight = true;
  session.generationStatus = "running";
  session.phase = "preview";
  await saveFramedArtSession(session);

  const version = nextVersionForStyle(session, style);
  const candidate = await buildFramedStyleCandidate(
    sessionId,
    session.originalUrl,
    style,
    version,
  );

  const updated = await loadFramedArtSession(sessionId);
  if (!updated) return null;

  upsertCandidate(updated, candidate);
  updated.inFlight = false;
  updated.generationStatus = candidate.cleanUrl ? "complete" : "failed";
  await saveFramedArtSession(updated);
  return updated;
}

/** @deprecated Use runFramedArtStyleGeneration — kept for any stale imports */
export const runFramedArtAllStylesGeneration = runFramedArtStyleGeneration;

export async function runFramedArtRegenerate(
  sessionId: string,
): Promise<FramedArtSession | null> {
  const session = await loadFramedArtSession(sessionId);
  if (!session || session.regenerateUsed) return session;

  const style = session.selectedStyle;
  if (!style) return session;

  session.regenerateUsed = true;
  session.inFlight = true;
  session.generationStatus = "running";
  await saveFramedArtSession(session);

  const latest = await loadFramedArtSession(sessionId);
  if (!latest?.selectedStyle) return null;

  const version = nextVersionForStyle(latest, style);
  const candidate = await buildFramedStyleCandidate(
    sessionId,
    latest.originalUrl,
    style,
    version,
  );

  const updated = await loadFramedArtSession(sessionId);
  if (!updated) return null;

  upsertCandidate(updated, candidate);
  updated.inFlight = false;
  updated.generationStatus = candidate.cleanUrl ? "complete" : "failed";
  await saveFramedArtSession(updated);
  return updated;
}
