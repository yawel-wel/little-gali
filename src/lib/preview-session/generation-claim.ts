import { createHash } from "crypto";
import { kvDel, kvSetNx } from "./kv";

/** How long a per-image generation claim blocks a second Gemini call. */
export const GENERATION_CLAIM_TTL_SECONDS = 5 * 60;

/** How long a full pipeline / approve schedule claim lasts. */
export const PIPELINE_CLAIM_TTL_SECONDS = 30 * 60;

export function hashSourceUrl(sourceUrl: string): string {
  return createHash("sha256").update(sourceUrl).digest("hex").slice(0, 16);
}

export function bwGenerationClaimKey(
  sessionId: string,
  slotIndex: number,
  sourceUrl: string,
): string {
  return `preview:gen-claim:bw:${sessionId}:${slotIndex}:${hashSourceUrl(sourceUrl)}`;
}

export function colorGenerationClaimKey(
  sessionId: string,
  slotIndex: number,
  style: string,
  sourceUrl: string,
): string {
  return `preview:gen-claim:color:${sessionId}:${slotIndex}:${style}:${hashSourceUrl(sourceUrl)}`;
}

export function pipelineScheduleClaimKey(sessionId: string): string {
  return `preview:pipeline-schedule:${sessionId}`;
}

export function approveBwClaimKey(sessionId: string): string {
  return `preview:approve-bw:${sessionId}`;
}

/**
 * Acquire an exclusive claim before calling Gemini.
 * Returns false if another worker already owns this work unit.
 */
export async function tryClaimGeneration(
  key: string,
  ttlSeconds: number = GENERATION_CLAIM_TTL_SECONDS,
): Promise<boolean> {
  return kvSetNx(key, "1", { ex: ttlSeconds });
}

export async function releaseGenerationClaim(key: string): Promise<void> {
  await kvDel(key);
}
