import { kvDel, kvGet, kvSet } from "@/lib/preview-session/kv";
import { framedArtSessionKey } from "@/lib/preview-session/redis";
import { COLOR_STYLES, DEFAULT_COLOR_STYLE } from "@/lib/preview-session/color-by-style";
import type {
  FramedArtSession,
  FramedArtSessionPublicView,
  FramedArtStyleCandidate,
} from "./types";

const FRAMED_ART_SESSION_TTL_SECONDS = 48 * 60 * 60;

export async function saveFramedArtSession(session: FramedArtSession): Promise<void> {
  session.updatedAt = new Date().toISOString();
  await kvSet(framedArtSessionKey(session.id), session, {
    ex: FRAMED_ART_SESSION_TTL_SECONDS,
  });
}

export async function loadFramedArtSession(
  sessionId: string,
): Promise<FramedArtSession | null> {
  return (await kvGet<FramedArtSession>(framedArtSessionKey(sessionId))) ?? null;
}

export async function deleteFramedArtSession(sessionId: string): Promise<void> {
  await kvDel(framedArtSessionKey(sessionId));
}

export function getCandidateForStyle(
  session: FramedArtSession,
  style: (typeof COLOR_STYLES)[number],
): FramedArtStyleCandidate | undefined {
  const matches = session.candidates.filter((c) => c.style === style);
  return matches.sort((a, b) => b.version - a.version)[0];
}

export function toPublicView(session: FramedArtSession): FramedArtSessionPublicView {
  return {
    id: session.id,
    updatedAt: session.updatedAt,
    phase: session.phase,
    generationStatus: session.generationStatus,
    originalUrl: session.originalUrl,
    candidates: session.candidates,
    selectedStyle: session.selectedStyle,
    regenerateUsed: session.regenerateUsed,
    inFlight: session.inFlight,
    canRegenerate: !session.regenerateUsed && !session.inFlight,
  };
}

export function resolveSelectedCandidate(
  session: FramedArtSession,
): FramedArtStyleCandidate | undefined {
  const style = session.selectedStyle ?? DEFAULT_COLOR_STYLE;
  return getCandidateForStyle(session, style);
}
