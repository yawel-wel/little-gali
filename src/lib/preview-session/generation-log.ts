import * as Sentry from "@sentry/nextjs";

type PreviewGenerationKind = "bw" | "color";

export type PreviewGenerationTrigger = "initial" | "regenerate" | "replace";

export type PreviewGenerationContext = {
  sessionId?: string;
  slot?: number;
  trigger?: PreviewGenerationTrigger;
  side?: PreviewGenerationKind;
  style?: string;
  candidateId?: string;
};

type LogAttributes = Record<string, string | number | boolean | undefined>;

const geminiPromptsLogged: Record<PreviewGenerationKind, boolean> = {
  bw: false,
  color: false,
};

function formatContext(context: LogAttributes): string {
  return Object.entries(context)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(" ");
}

function toSentryAttributes(
  context: LogAttributes,
): Record<string, string | number | boolean> {
  const attributes: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined) {
      attributes[key] = value;
    }
  }
  return attributes;
}

function applySentrySessionContext(context?: PreviewGenerationContext): void {
  if (!context?.sessionId) return;
  Sentry.setUser({ id: context.sessionId });
  Sentry.setTag("sessionId", context.sessionId);
}

function mergeContext(
  base: PreviewGenerationContext | undefined,
  extra: LogAttributes,
): LogAttributes {
  return {
    sessionId: base?.sessionId,
    slot: base?.slot,
    trigger: base?.trigger,
    side: base?.side ?? extra.side as PreviewGenerationKind | undefined,
    style: base?.style,
    candidateId: base?.candidateId,
    ...extra,
  };
}

function emitSentryLog(
  level: "info" | "warn" | "error",
  message: string,
  context: PreviewGenerationContext | undefined,
  extra: LogAttributes = {},
): void {
  applySentrySessionContext(context);
  const attributes = toSentryAttributes(mergeContext(context, extra));
  if (level === "info") {
    Sentry.logger.info(message, attributes);
  } else if (level === "warn") {
    Sentry.logger.warn(message, attributes);
  } else {
    Sentry.logger.error(message, attributes);
  }
}

export function logPreviewImageReplaced(context: {
  sessionId: string;
  slot: number;
  inputVersion?: number;
  candidateId?: string;
}): void {
  Sentry.setUser({ id: context.sessionId });
  Sentry.setTag("sessionId", context.sessionId);
  console.info(
    `[preview] image replaced sessionId=${context.sessionId} slot=${context.slot} inputVersion=${context.inputVersion ?? "unknown"}`,
  );
  Sentry.logger.info("preview.image_replaced", {
    sessionId: context.sessionId,
    slot: context.slot,
    inputVersion: context.inputVersion,
    candidateId: context.candidateId,
  });
}

export function logPreviewCandidateReselected(context: {
  sessionId: string;
  slot: number;
  side: "bw" | "color";
  previousCandidateId: string;
  candidateId: string;
  style?: string;
}): void {
  Sentry.setUser({ id: context.sessionId });
  Sentry.setTag("sessionId", context.sessionId);
  console.info(
    `[preview] candidate reselected sessionId=${context.sessionId} slot=${context.slot} side=${context.side} from=${context.previousCandidateId} to=${context.candidateId}`,
  );
  Sentry.logger.info("preview.candidate_reselected", {
    sessionId: context.sessionId,
    slot: context.slot,
    side: context.side,
    previousCandidateId: context.previousCandidateId,
    candidateId: context.candidateId,
    style: context.style,
  });
}

export function logPreviewColorStyleSelected(
  context: {
    sessionId: string;
    style: string;
    previousStyle: string;
    allSlotsCached: boolean;
  },
): void {
  Sentry.setUser({ id: context.sessionId });
  Sentry.setTag("sessionId", context.sessionId);
  console.info(
    `[preview-color] style selected sessionId=${context.sessionId} style=${context.style} previousStyle=${context.previousStyle} allSlotsCached=${context.allSlotsCached}`,
  );
  Sentry.logger.info("preview.color_style.selected", {
    sessionId: context.sessionId,
    style: context.style,
    previousStyle: context.previousStyle,
    allSlotsCached: context.allSlotsCached,
  });
}

export function logPreviewApiOperation(
  operation: "image_regeneration" | "image_replacement",
  phase: "started" | "completed" | "failed",
  context: PreviewGenerationContext,
  extra: LogAttributes = {},
): void {
  applySentrySessionContext(context);
  const attributes = toSentryAttributes(mergeContext(context, extra));
  const message = `preview.${operation}.${phase}`;
  if (phase === "failed") {
    Sentry.logger.error(message, attributes);
    return;
  }
  Sentry.logger.info(message, attributes);
}

export function logPreviewGenerationSuccess(
  kind: PreviewGenerationKind,
  context: LogAttributes,
  generationContext?: PreviewGenerationContext,
): void {
  console.info(`[preview-${kind}] success ${formatContext(context)}`);
  emitSentryLog("info", `preview.generation.success`, generationContext, {
    ...context,
    side: kind,
  });
}

export function logPreviewGenerationFailure(
  kind: PreviewGenerationKind,
  context: LogAttributes,
  error: unknown,
  generationContext?: PreviewGenerationContext,
): void {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(
    `[preview-${kind}] failed ${formatContext(context)} detail=${detail}`,
  );
  emitSentryLog("error", `preview.generation.failed`, generationContext, {
    ...context,
    side: kind,
    errorMessage: detail,
  });
}

export function logPreviewGenerationSummary(
  kind: PreviewGenerationKind,
  context: LogAttributes,
  generationContext?: PreviewGenerationContext,
): void {
  console.info(`[preview-${kind}] summary ${formatContext(context)}`);
  emitSentryLog("info", `preview.generation.summary`, generationContext, {
    ...context,
    side: kind,
  });
}

/** Log Gemini call start (console may include prompts once; Sentry never logs prompts). */
export function logGeminiRequest(
  kind: PreviewGenerationKind,
  options: {
    model: string;
    systemInstruction: string;
    userPrompt: string;
    attempt?: number;
  },
  generationContext?: PreviewGenerationContext,
): void {
  const attemptSuffix =
    options.attempt !== undefined ? ` attempt=${options.attempt}` : "";

  if (!geminiPromptsLogged[kind]) {
    geminiPromptsLogged[kind] = true;
    console.info(
      `[preview-${kind}] gemini request (prompts logged once) model=${options.model}${attemptSuffix}`,
    );
    console.info(
      `[preview-${kind}] gemini systemInstruction:\n${options.systemInstruction}`,
    );
    console.info(`[preview-${kind}] gemini userPrompt:\n${options.userPrompt}`);
  } else {
    console.info(
      `[preview-${kind}] gemini request model=${options.model}${attemptSuffix}`,
    );
  }

  emitSentryLog("info", "preview.gemini.request", generationContext, {
    model: options.model,
    attempt: options.attempt,
    side: kind,
  });
}

export function logGeminiResponse(
  kind: PreviewGenerationKind,
  context: LogAttributes,
  generationContext?: PreviewGenerationContext,
): void {
  console.info(`[preview-${kind}] gemini response ${formatContext(context)}`);
  emitSentryLog("info", "preview.gemini.response", generationContext, {
    ...context,
    side: kind,
  });
}
