import mixpanel from "mixpanel-browser";

// ─── Event names ─────────────────────────────────────────────────────────────

export const ANALYTICS_EVENTS = {
  // Booklet flow
  BOOKLET_UPLOAD_STARTED: "booklet_upload_started",
  BOOKLET_UPLOAD_COMPLETED: "booklet_upload_completed",
  BOOKLET_BW_PREVIEW_VIEWED: "booklet_bw_preview_viewed",
  BOOKLET_COLOR_PREVIEW_VIEWED: "booklet_color_preview_viewed",
  BOOKLET_STYLE_SELECTED: "booklet_style_selected",
  BOOKLET_IMAGE_REPLACED: "booklet_image_replaced",
  BOOKLET_REGENERATED: "booklet_regenerated",
  BOOKLET_LIMIT_REACHED: "booklet_limit_reached",
  BOOKLET_CHANGES_EXHAUSTED: "booklet_changes_exhausted",
  BOOKLET_ADDED_TO_CART: "booklet_added_to_cart",
  // Framed photo flow
  FRAME_UPLOAD_STARTED: "frame_upload_started",
  FRAME_UPLOAD_COMPLETED: "frame_upload_completed",
  FRAME_PREVIEW_VIEWED: "frame_preview_viewed",
  FRAME_STYLE_SELECTED: "frame_style_selected",
  FRAME_REGENERATED: "frame_regenerated",
  FRAME_ADDED_TO_CART: "frame_added_to_cart",
  // General
  PURCHASE_COMPLETED: "purchase_completed",
  CART_ABANDONED: "cart_abandoned",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type ProductType = "booklet" | "frame";

/** Which preview quota the user hit when booklet_limit_reached fires. */
export type PreviewLimitType =
  | "preview_rate_limit"
  | "generation_rate_limit";

export type EventProperties = {
  booklet_upload_started: Record<string, never>;
  booklet_upload_completed: { image_count: number };
  booklet_bw_preview_viewed: Record<string, never>;
  booklet_color_preview_viewed: Record<string, never>;
  booklet_style_selected: { style_name: string };
  booklet_image_replaced: Record<string, never>;
  booklet_regenerated: Record<string, never>;
  booklet_limit_reached: { limit_type: PreviewLimitType };
  booklet_changes_exhausted: { changes_used: number };
  booklet_added_to_cart: { changes_used?: number };
  frame_upload_started: Record<string, never>;
  frame_upload_completed: { image_count: number };
  frame_preview_viewed: Record<string, never>;
  frame_style_selected: { style_name: string };
  frame_regenerated: Record<string, never>;
  frame_added_to_cart: Record<string, never>;
  purchase_completed: { product_type: ProductType; amount: number };
  cart_abandoned: Record<string, never>;
};

let initialized = false;

export function initMixpanel(): void {
  if (typeof window === "undefined" || initialized) {
    return;
  }

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    return;
  }

  const apiHost =
    process.env.NEXT_PUBLIC_MIXPANEL_API_HOST ?? "https://api.mixpanel.com";

  try {
    mixpanel.init(token, {
      debug: process.env.NODE_ENV === "development",
      track_pageview: true,
      persistence: "localStorage",
      api_host: apiHost,
    });
    initialized = true;
  } catch (error) {
    console.error("Mixpanel init failed:", error);
  }
}

export function getMixpanelDistinctId(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    if (!initialized) {
      initMixpanel();
    }
    const distinctId = mixpanel.get_distinct_id?.();
    return typeof distinctId === "string" && distinctId.length > 0
      ? distinctId
      : undefined;
  } catch {
    return undefined;
  }
}

/** Attach Mixpanel identity to server-side preview API calls. */
export function withAnalyticsHeaders(init: RequestInit = {}): RequestInit {
  const distinctId = getMixpanelDistinctId();
  if (!distinctId) {
    return init;
  }

  const headers = new Headers(init.headers);
  headers.set("X-Mp-Distinct-Id", distinctId);
  return { ...init, headers };
}

export function registerPreviewSessionSuperProperties(sessionId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!initialized) {
      initMixpanel();
    }
    mixpanel.register({
      preview_session_id: sessionId,
      product_type: "booklet",
    });
  } catch (error) {
    console.error("Analytics register failed:", error);
  }
}

export function track<E extends AnalyticsEvent>(
  event: E,
  properties?: EventProperties[E],
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!initialized) {
      initMixpanel();
    }
    mixpanel.track(event, properties);
  } catch (error) {
    console.error("Analytics track failed:", error);
  }
}
