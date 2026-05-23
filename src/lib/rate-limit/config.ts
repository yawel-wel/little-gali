import type { Duration } from "@upstash/ratelimit";

const DEFAULT_GENERATION_LIMIT = 35;
const DEFAULT_GENERATION_WINDOW = "24 h";
const DEFAULT_FULL_GENERATION_LIMIT = 1;
const DEFAULT_FULL_GENERATION_WINDOW_SECONDS = 24 * 60 * 60;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value?.trim()) {
    return fallback;
  }
  const parsed = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

/** Per preview session: regenerate / replace / color generation calls (Upstash sliding window). */
export function getGenerationRateLimitConfig(): {
  limit: number;
  window: Duration;
} {
  const window =
    process.env.PREVIEW_GENERATION_RATE_WINDOW?.trim() || DEFAULT_GENERATION_WINDOW;
  return {
    limit: parsePositiveInt(
      process.env.PREVIEW_GENERATION_RATE_LIMIT,
      DEFAULT_GENERATION_LIMIT,
    ),
    window: window as Duration,
  };
}

/** Per client IP hash: how many full preview pipelines can be started in the window. */
export function getFullGenerationRateLimitConfig(): {
  limit: number;
  windowSeconds: number;
} {
  return {
    limit: parsePositiveInt(
      process.env.PREVIEW_FULL_GENERATION_RATE_LIMIT,
      DEFAULT_FULL_GENERATION_LIMIT,
    ),
    windowSeconds: parsePositiveInt(
      process.env.PREVIEW_FULL_GENERATION_WINDOW_SECONDS,
      DEFAULT_FULL_GENERATION_WINDOW_SECONDS,
    ),
  };
}
