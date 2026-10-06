import * as Sentry from "@sentry/nextjs";
import { formatUnknownError } from "@/lib/preview-session/generation-errors";

/** Which part of the site failed — becomes the `area` tag for filtering in Sentry. */
export type ErrorArea =
  | "cart"
  | "cart_images"
  | "preview"
  | "framed_art"
  | "upload"
  | "suggest_crop"
  | "shopify_webhook"
  | "email"
  | "loox";

type ErrorDetails = Record<string, string | number | boolean | null | undefined>;

const MAX_DETAIL_LENGTH = 300;

function describe(detail: unknown): string {
  if (detail instanceof Error || typeof detail !== "object" || detail === null) {
    return formatUnknownError(detail);
  }
  try {
    return JSON.stringify(detail).slice(0, MAX_DETAIL_LENGTH);
  } catch {
    return String(detail);
  }
}

/**
 * Logs to the console and sends to Sentry with a readable title, e.g.
 * "Add to cart failed: Shopify userErrors [...]". Use in every catch block
 * (and for failed upstream responses) on paths customers depend on.
 *
 * `detail` can be a thrown error, a failed response body, or any object.
 * The original Error is kept as `cause`, so Sentry still shows its stack.
 */
export function reportError(
  message: string,
  detail: unknown,
  context: { area: ErrorArea; sessionId?: string } & ErrorDetails,
): void {
  const { area, sessionId, ...details } = context;
  const summary = describe(detail);

  console.error(`${message}:`, detail, details);

  const error = new Error(`${message}: ${summary}`, {
    cause: detail instanceof Error ? detail : undefined,
  });

  Sentry.withScope((scope) => {
    scope.setTag("area", area);
    if (sessionId) {
      scope.setTag("sessionId", sessionId);
    }
    scope.setContext("details", details);
    Sentry.captureException(error);
  });
}
