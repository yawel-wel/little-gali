import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { tryConsumeSupportGenerationBypass } from "@/lib/preview-session/support-bypass";
import { isPreviewLimitsBypassed } from "@/lib/preview-session/preview-limits-bypass";
import { getGenerationRateLimitConfig } from "./config";
import { GENERATION_LIMIT_ERROR_CODE } from "./constants";

export { GENERATION_LIMIT_ERROR_CODE } from "./constants";

const redis = Redis.fromEnv();
const generationRateLimitConfig = getGenerationRateLimitConfig();

export const generationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    generationRateLimitConfig.limit,
    generationRateLimitConfig.window,
  ),
  analytics: false,
  prefix: "little-gali:generation",
});

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

function isGenerationRateLimitDisabled(): boolean {
  return isPreviewLimitsBypassed();
}

/** Read-only check; does not consume a request or support bypass credits. */
export async function peekGenerationLimit(
  sessionId: string,
): Promise<{ allowed: boolean }> {
  if (isGenerationRateLimitDisabled()) {
    return { allowed: true };
  }

  const { remaining } = await generationLimiter.getRemaining(sessionId);
  return { allowed: remaining > 0 };
}

export async function checkGenerationLimit(
  sessionId: string,
): Promise<RateLimitResult> {
  if (await tryConsumeSupportGenerationBypass(sessionId)) {
    return {
      success: true,
      remaining: generationRateLimitConfig.limit,
      reset: Date.now() + 24 * 60 * 60 * 1000,
    };
  }

  if (isGenerationRateLimitDisabled()) {
    return {
      success: true,
      remaining: generationRateLimitConfig.limit,
      reset: Date.now() + 24 * 60 * 60 * 1000,
    };
  }

  const sessionResult = await generationLimiter.limit(sessionId);
  if (!sessionResult.success) {
    return {
      success: false,
      remaining: sessionResult.remaining,
      reset: sessionResult.reset,
    };
  }

  return {
    success: true,
    remaining: sessionResult.remaining,
    reset: sessionResult.reset,
  };
}

export function generationRateLimitResponse(
  rateLimitResult: RateLimitResult,
  responseSessionId?: string,
): NextResponse {
  return NextResponse.json(
    {
      error: GENERATION_LIMIT_ERROR_CODE,
      message:
        "You have reached the maximum number of generations for today. Please try again tomorrow.",
      reset: rateLimitResult.reset,
      ...(responseSessionId ? { sessionId: responseSessionId } : {}),
    },
    { status: 429 },
  );
}

export async function assertGenerationRateLimit(
  sessionId: string,
  responseSessionId?: string,
): Promise<NextResponse | null> {
  const rateLimitResult = await checkGenerationLimit(sessionId);
  if (!rateLimitResult.success) {
    return generationRateLimitResponse(
      rateLimitResult,
      responseSessionId ?? sessionId,
    );
  }
  return null;
}
