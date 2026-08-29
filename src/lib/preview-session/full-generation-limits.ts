import type { NextRequest } from "next/server";
import { getFullGenerationRateLimitConfig } from "@/lib/rate-limit/config";
import { getRequestIp, hashClientIp } from "./hash";
import {
  isFullGenerationLimitBypassed,
  isPreviewLimitsDevResetAllowed,
} from "./preview-limits-bypass";
import {
  peekFullGenerationRateLimitState,
  resetFullGenerationRateLimit,
} from "./rate-limit";

function limitsMeta() {
  const limitsBypassed = isFullGenerationLimitBypassed();
  return {
    limitsBypassed,
    limitsEnforced: !limitsBypassed,
    devResetAvailable: isPreviewLimitsDevResetAllowed(),
  };
}

export type PreviewLimitsSnapshot = {
  windowHours: number;
  fullGenerationLimit: number;
  fullGenerationsUsed: number;
  fullGenerationsRemaining: number;
  isLastFullGenerationAvailable: boolean;
  resetAt: string | null;
  limitsBypassed: boolean;
  limitsEnforced: boolean;
  devResetAvailable: boolean;
};

function windowSecondsToHours(windowSeconds: number): number {
  return Math.max(1, Math.round(windowSeconds / 3600));
}

export function getPreviewLimitsConfig(): {
  windowSeconds: number;
  windowHours: number;
  fullGenerationLimit: number;
} {
  const { limit, windowSeconds } = getFullGenerationRateLimitConfig();
  return {
    windowSeconds,
    windowHours: windowSecondsToHours(windowSeconds),
    fullGenerationLimit: limit,
  };
}

export async function getPreviewLimitsSnapshot(
  request?: NextRequest,
): Promise<PreviewLimitsSnapshot> {
  const { windowSeconds, windowHours, fullGenerationLimit } =
    getPreviewLimitsConfig();

  if (isFullGenerationLimitBypassed()) {
    return {
      windowHours,
      fullGenerationLimit,
      fullGenerationsUsed: 0,
      fullGenerationsRemaining: fullGenerationLimit,
      isLastFullGenerationAvailable: false,
      resetAt: null,
      ...limitsMeta(),
    };
  }

  const ipHash = request
    ? hashClientIp(getRequestIp(request))
    : hashClientIp("unknown");
  const state = await peekFullGenerationRateLimitState(ipHash);

  const fullGenerationsUsed = Math.min(state.count, fullGenerationLimit);
  const fullGenerationsRemaining = Math.max(
    0,
    fullGenerationLimit - fullGenerationsUsed,
  );

  return {
    windowHours,
    fullGenerationLimit,
    fullGenerationsUsed,
    fullGenerationsRemaining,
    isLastFullGenerationAvailable: fullGenerationsRemaining === 1,
    resetAt: state.resetAt,
    ...limitsMeta(),
  };
}

export async function resetPreviewLimitsForClient(
  request: NextRequest,
): Promise<PreviewLimitsSnapshot> {
  const ipHash = hashClientIp(getRequestIp(request));
  await resetFullGenerationRateLimit(ipHash);
  return getPreviewLimitsSnapshot(request);
}
