import type { ServerAnalyticsContext } from "@/lib/analytics-context";
import type { ServerProductType } from "@/lib/analytics-server";
import { loadPreviewSession } from "@/lib/preview-session/store";

type OrderLineItem = {
  properties?: Array<{ name: string; value: string }>;
  properties_object?: Record<string, string>;
};

function getLineItemProperty(
  item: OrderLineItem,
  key: string,
): string | undefined {
  const fromArray = item.properties?.find((property) => property.name === key)
    ?.value;
  if (fromArray) {
    return fromArray;
  }
  return item.properties_object?.[key];
}

export function resolveOrderProductType(orderData: {
  line_items?: OrderLineItem[];
}): ServerProductType {
  for (const item of orderData.line_items ?? []) {
    const productType = getLineItemProperty(item, "_product_type");
    if (productType === "framed_art") {
      return "frame";
    }
  }
  return "booklet";
}

export async function resolvePurchaseAnalyticsContext(orderData: {
  line_items?: OrderLineItem[];
}): Promise<ServerAnalyticsContext> {
  const lineItems = orderData.line_items ?? [];
  const productType = resolveOrderProductType(orderData);

  for (const item of lineItems) {
    const distinctId = getLineItemProperty(item, "_mixpanel_distinct_id");
    if (distinctId) {
      return {
        distinctId,
        sessionId:
          getLineItemProperty(item, "_preview_session_id") ??
          getLineItemProperty(item, "_framed_art_session_id"),
        productType,
      };
    }
  }

  for (const item of lineItems) {
    const previewSessionId = getLineItemProperty(item, "_preview_session_id");
    if (previewSessionId) {
      const session = await loadPreviewSession(previewSessionId);
      return {
        distinctId: session?.mixpanelDistinctId ?? previewSessionId,
        sessionId: previewSessionId,
        productType: "booklet",
      };
    }
  }

  for (const item of lineItems) {
    const framedSessionId = getLineItemProperty(item, "_framed_art_session_id");
    if (framedSessionId) {
      return {
        distinctId: framedSessionId,
        sessionId: framedSessionId,
        productType: "frame",
      };
    }
  }

  return { distinctId: "server", productType };
}

export async function resolveMixpanelDistinctIdForCart(params: {
  mixpanelDistinctId?: string;
  previewSessionId?: string;
}): Promise<string | undefined> {
  if (params.mixpanelDistinctId) {
    return params.mixpanelDistinctId;
  }
  if (!params.previewSessionId) {
    return undefined;
  }
  const session = await loadPreviewSession(params.previewSessionId);
  return session?.mixpanelDistinctId;
}
