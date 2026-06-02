import type { GenerationError } from "./types";

/** Server-side fallback; preview UI uses i18n when code is prohibited_content. */
export const PROHIBITED_CONTENT_ERROR_MESSAGE =
  "התמונה נחסמה על ידי המודל.\nיש להעלות תמונה אחרת במקום.";

export function isProhibitedContentErrorMessage(message: string): boolean {
  return message.includes("PROHIBITED_CONTENT");
}

export function classifyGenerationError(error: unknown): GenerationError {
  const message =
    error instanceof Error ? error.message : "Unknown generation error";

  if (isProhibitedContentErrorMessage(message)) {
    return {
      code: "prohibited_content",
      message: PROHIBITED_CONTENT_ERROR_MESSAGE,
    };
  }

  const lower = message.toLowerCase();
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
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return {
      code: "timeout",
      message: "העיבוד לקח יותר מדי זמן. נסו שוב בעוד רגע.",
    };
  }
  if (process.env.NODE_ENV === "development") {
    return {
      code: "generic",
      message: message.slice(0, 500),
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
