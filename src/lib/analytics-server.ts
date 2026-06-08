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

export async function trackServerEvent(
  event: string,
  properties: Record<string, string | number | boolean>,
): Promise<void> {
  const token = getMixpanelToken();
  if (!token) {
    return;
  }

  try {
    const payload = {
      event,
      properties: {
        token,
        distinct_id: "server",
        ...properties,
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

export function trackGenerationDuration(params: {
  generation_type: ServerGenerationType;
  duration_seconds: number;
  success: boolean;
}): void {
  void trackServerEvent(SERVER_EVENTS.GENERATION_DURATION, params);
}

export function trackServerError(params: {
  step: string;
  error_message: string;
}): void {
  void trackServerEvent(SERVER_EVENTS.ERROR_SERVER, params);
}

export function trackSensitiveContentError(params: {
  step: string;
  product_type: ServerProductType;
}): void {
  void trackServerEvent(SERVER_EVENTS.ERROR_SENSITIVE_CONTENT, params);
}

export function trackPurchaseCompleted(params: {
  product_type: ServerProductType;
  amount: number;
  order_id?: string;
}): void {
  void trackServerEvent(SERVER_EVENTS.PURCHASE_COMPLETED, params);
}
