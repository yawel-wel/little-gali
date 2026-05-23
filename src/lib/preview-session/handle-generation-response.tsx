"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { GENERATION_LIMIT_ERROR_CODE } from "@/lib/rate-limit/constants";

export class GenerationRateLimitError extends Error {
  constructor() {
    super("generation_rate_limit");
    this.name = "GenerationRateLimitError";
  }
}

export function isGenerationRateLimited(
  response: Response,
  data: { error?: string },
): boolean {
  return (
    response.status === 429 && data.error === GENERATION_LIMIT_ERROR_CODE
  );
}

export function throwIfGenerationRateLimited(
  response: Response,
  data: { error?: string },
): void {
  if (isGenerationRateLimited(response, data)) {
    throw new GenerationRateLimitError();
  }
}

type GenerationRateLimitTranslator = (
  key: string,
) => string;

export function getGenerationRateLimitMessage(
  t: GenerationRateLimitTranslator,
): ReactNode {
  return (
    <>
      {t("preview.generationRateLimit")}
      <Link
        href="/contact"
        className="underline underline-offset-2 hover:opacity-80"
      >
        {t("preview.generationRateLimitContactLink")}
      </Link>
      {t("preview.generationRateLimitAfter")}
    </>
  );
}

export function getGenerationApiError(
  response: Response,
  data: { error?: string },
  t: GenerationRateLimitTranslator,
  fallback: string,
): ReactNode {
  if (isGenerationRateLimited(response, data)) {
    return getGenerationRateLimitMessage(t);
  }
  return data.error || fallback;
}

export function isGenerationRateLimitErrorNode(
  error: ReactNode | null,
): boolean {
  return error !== null && typeof error !== "string";
}
