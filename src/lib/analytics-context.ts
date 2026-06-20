import type { ServerProductType } from "@/lib/analytics-server";

export const MIXPANEL_DISTINCT_ID_HEADER = "x-mp-distinct-id";

export type ServerAnalyticsContext = {
  distinctId: string;
  sessionId?: string;
  productType?: ServerProductType;
};

export function getMixpanelDistinctIdFromRequest(
  request: Request,
): string | undefined {
  const value = request.headers.get(MIXPANEL_DISTINCT_ID_HEADER)?.trim();
  return value || undefined;
}

/** Persist browser Mixpanel id on the preview session for background jobs. */
export function captureMixpanelDistinctIdOnSession(
  session: { mixpanelDistinctId?: string },
  request: Request,
): void {
  const distinctId = getMixpanelDistinctIdFromRequest(request);
  if (distinctId) {
    session.mixpanelDistinctId = distinctId;
  }
}

export function analyticsContextFromSession(
  session: { id: string; mixpanelDistinctId?: string },
  productType: ServerProductType = "booklet",
): ServerAnalyticsContext {
  return {
    distinctId: session.mixpanelDistinctId ?? session.id,
    sessionId: session.id,
    productType,
  };
}

export function analyticsContextFromRequest(
  request: Request,
  session?: { id: string; mixpanelDistinctId?: string },
  productType: ServerProductType = "booklet",
): ServerAnalyticsContext {
  const fromHeader = getMixpanelDistinctIdFromRequest(request);
  if (session) {
    return {
      distinctId: fromHeader ?? session.mixpanelDistinctId ?? session.id,
      sessionId: session.id,
      productType,
    };
  }
  return {
    distinctId: fromHeader ?? "server",
    productType,
  };
}
