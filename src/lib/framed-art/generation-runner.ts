import { randomUUID } from "crypto";
import type { StyleType } from "@/components/style-selector";
import { generateColorImageBuffer } from "@/lib/preview-session/generate-color";
import { toGenerationError } from "@/lib/preview-session/generate-bw";
import {
  framedArtColorOutputPublicId,
  framedArtColorWatermarkedPublicId,
} from "./cloudinary-paths";
import {
  getCandidateForStyle,
  loadFramedArtSession,
  saveFramedArtSession,
} from "./store";
import type { FramedArtSession, FramedArtStyleCandidate } from "./types";
import { uploadBufferToCloudinaryPublicId } from "@/lib/preview-session/cloudinary";
import { applyPreviewWatermark } from "@/lib/preview-session/watermark";

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

  try {
    const cleanBuffer = await generateColorImageBuffer(sourceUrl, style, {
      sessionId,
      slot: 0,
      trigger: version > 1 ? "regenerate" : "initial",
      side: "color",
    });

    const cleanPath = framedArtColorOutputPublicId(sessionId, style, version);
    const previewPath = framedArtColorWatermarkedPublicId(
      sessionId,
      style,
      version,
    );

    const cleanUpload = await uploadBufferToCloudinaryPublicId(
      cleanBuffer,
      cleanPath,
    );
    const watermarkedBuffer = await applyPreviewWatermark(cleanBuffer);
    const previewUpload = await uploadBufferToCloudinaryPublicId(
      watermarkedBuffer,
      previewPath,
    );

    candidate.cleanUrl = cleanUpload.secureUrl;
    candidate.cleanPublicId = cleanUpload.publicId;
    candidate.previewUrl = previewUpload.secureUrl;
    candidate.previewPublicId = previewUpload.publicId;
  } catch (error) {
    candidate.error = toGenerationError(error);
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
  const session = await loadFramedArtSession(sessionId);
  if (!session?.selectedStyle) return null;

  const style = session.selectedStyle;
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
