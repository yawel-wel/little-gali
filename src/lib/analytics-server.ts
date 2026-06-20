import type { ServerAnalyticsContext } from "@/lib/analytics-context";

export type ServerGenerationType =
  | "booklet_bw"
  | "booklet_color"
  | "booklet_regen"
  | "frame";

export type ServerProductType = "booklet" | "frame";

const SERVER_EVENTS = {
  GENERATION_DURATION: "generation_duration",
  ERROR_SERVER: "error_server",
  ERROR_SENSITIVE_CONTENT: "error_sensitive_content",
  PURCHASE_COMPLETED: "purchase_completed",
} as const;

function getMixpanelToken(): string | undefined {
  return process.env.MIXPANEL_TOKEN;
}

function getMixpanelTrackUrl(): string {
  const apiHost =
    process.env.MIXPANEL_API_HOST ?? "https://api.mixpanel.com";
  return `${apiHost.replace(/\/$/, "")}/track`;
}

function mergeAnalyticsProperties(
  properties: Record<string, string | number | boolean>,
  context?: ServerAnalyticsContext,
): Record<string, string | number | boolean> {
  const merged: Record<string, string | number | boolean> = { ...properties };

  if (context?.sessionId && merged.session_id === undefined) {
    merged.session_id = context.sessionId;
  }
  if (context?.productType && merged.product_type === undefined) {
    merged.product_type = context.productType;
  }

  return merged;
}

export async function trackServerEvent(
  event: string,
  properties: Record<string, string | number | boolean>,
  context?: ServerAnalyticsContext,
): Promise<void> {
  const token = getMixpanelToken();
  if (!token) {
    return;
  }

  const distinctId =
    context?.distinctId ??
    (typeof properties.session_id === "string"
      ? properties.session_id
      : "server");

  try {
    const payload = {
      event,
      properties: {
        token,
        distinct_id: distinctId,
        ...mergeAnalyticsProperties(properties, context),
      },
    };

    await fetch(getMixpanelTrackUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${Buffer.from(JSON.stringify(payload)).toString("base64")}`,
    });
  } catch (error) {
    console.error("Server analytics track failed:", error);
  }
}

export function trackGenerationDuration(
  params: {
    generation_type: ServerGenerationType;
    duration_seconds: number;
    success: boolean;
    slots_total?: number;
    slots_succeeded?: number;
    slots_failed?: number;
  },
  context?: ServerAnalyticsContext,
): void {
  void trackServerEvent(SERVER_EVENTS.GENERATION_DURATION, params, context);
}

type GenerationResultLike = {
  previewUrl?: string | null;
  cleanUrl?: string | null;
  error?: unknown;
};

/** One analytics event per generation step (batch), not per slot/image. */
export function trackGenerationStepDuration(params: {
  generation_type: ServerGenerationType;
  startedAt: number;
  results: ReadonlyArray<GenerationResultLike>;
  context?: ServerAnalyticsContext;
}): void {
  if (params.results.length === 0) {
    return;
  }

  const succeeded = params.results.filter(
    (result) => Boolean(result.previewUrl || result.cleanUrl),
  ).length;
  const failed = params.results.filter((result) => result.error).length;

  trackGenerationDuration(
    {
      generation_type: params.generation_type,
      duration_seconds: Math.round((Date.now() - params.startedAt) / 100) / 10,
      success: failed === 0 && succeeded > 0,
      slots_total: params.results.length,
      slots_succeeded: succeeded,
      slots_failed: failed,
    },
    params.context,
  );
}

export function trackServerError(
  params: {
    step: string;
    error_message: string;
    session_id?: string;
  },
  context?: ServerAnalyticsContext,
): void {
  void trackServerEvent(SERVER_EVENTS.ERROR_SERVER, params, context);
}

export function trackSensitiveContentError(
  params: {
    step: string;
    product_type: ServerProductType;
    session_id?: string;
    slot_index?: number;
  },
  context?: ServerAnalyticsContext,
): void {
  void trackServerEvent(SERVER_EVENTS.ERROR_SENSITIVE_CONTENT, params, context);
}

export function trackPurchaseCompleted(
  params: {
    product_type: ServerProductType;
    amount: number;
    order_id?: string;
  },
  context?: ServerAnalyticsContext,
): void {
  void trackServerEvent(SERVER_EVENTS.PURCHASE_COMPLETED, params, context);
}
