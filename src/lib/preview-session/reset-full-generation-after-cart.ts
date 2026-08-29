import type { NextRequest } from "next/server";
import { getRequestIp, hashClientIp } from "@/lib/preview-session/hash";
import { resetFullGenerationRateLimit } from "@/lib/preview-session/rate-limit";

/**
 * After a soft-book / gift-set is added to cart, clear the per-IP full-generation
 * counter so PREVIEW_FULL_GENERATION_RATE_LIMIT applies again. Never fails the cart.
 */
export async function resetFullGenerationLimitAfterBookCart(
  request: NextRequest,
): Promise<void> {
  try {
    const ipHash = hashClientIp(getRequestIp(request));
    await resetFullGenerationRateLimit(ipHash);
  } catch (error) {
    console.error(
      "Failed to reset full-generation limit after book cart add:",
      error,
    );
  }
}
