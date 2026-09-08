import type { GenerationError } from "./types";

/** Server-side fallback; preview UI uses i18n when code is prohibited_content. */
export const PROHIBITED_CONTENT_ERROR_MESSAGE =
  "התמונה נחסמה על ידי המודל.\nיש להעלות תמונה אחרת במקום.";

export function isProhibitedContentErrorMessage(message: string): boolean {
  return message.includes("PROHIBITED_CONTENT");
}

function errorCode(error: object): string | undefined {
  if (!("code" in error)) return undefined;
  const code = error.code;
  return typeof code === "string" || typeof code === "number"
    ? String(code)
    : undefined;
}

/** Walks Error.cause so Node `fetch failed` includes UND_ERR_CONNECT_TIMEOUT etc. */
export function formatUnknownError(error: unknown, depth = 0): string {
  if (error == null) {
    return "unknown";
  }
  if (typeof error !== "object") {
    return String(error);
  }

  const name = error instanceof Error ? error.name : undefined;
  const message = error instanceof Error ? error.message : String(error);
  const code = errorCode(error);
  const head = [name, message].filter(Boolean).join(": ");
  const withCode = code ? `${head} (${code})` : head;

  if (error instanceof Error && error.cause && depth < 4) {
    return `${withCode} <- ${formatUnknownError(error.cause, depth + 1)}`;
  }
  return withCode;
}

export function classifyGenerationError(error: unknown): GenerationError {
  const detail = formatUnknownError(error);
  const lower = detail.toLowerCase();

  if (isProhibitedContentErrorMessage(detail)) {
    return {
      code: "prohibited_content",
      message: PROHIBITED_CONTENT_ERROR_MESSAGE,
    };
  }

  if (
    lower.includes("safety") ||
    lower.includes("blocked") ||
    lower.includes("policy") ||
    lower.includes("harm")
  ) {
    return {
      code: "safety",
      message:
        "לא הצלחנו לעבד את התמונה. נסו תמונה אחרת עם פחות רגישות לפרטיות.",
    };
  }
  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("etimedout") ||
    lower.includes("und_err_connect_timeout")
  ) {
    return {
      code: "timeout",
      message:
        process.env.NODE_ENV === "development"
          ? detail.slice(0, 500)
          : "העיבוד לקח יותר מדי זמן. נסו שוב בעוד רגע.",
    };
  }
  if (process.env.NODE_ENV === "development") {
    return {
      code: "generic",
      message: detail.slice(0, 500),
    };
  }
  return {
    code: "generic",
    message: "משהו השתבש בזמן יצירת התמונה. נסו שוב.",
  };
}

export function isFreeGenerationError(error?: GenerationError): boolean {
  return error?.code === "prohibited_content";
}

export function shouldStopGeminiRetry(classified: GenerationError): boolean {
  return (
    classified.code === "safety" ||
    classified.code === "prohibited_content"
  );
}
