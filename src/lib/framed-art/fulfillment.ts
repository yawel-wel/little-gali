import type { StyleType } from "@/components/style-selector";
import {
  SHOPIFY_LINE_ATTRIBUTE_MAX_LENGTH,
  publicIdFromCloudinaryUrl,
} from "@/lib/preview-session/cloudinary";
import { getCandidateForStyle, resolveSelectedCandidate } from "./store";
import type { FramedArtSession } from "./types";

export type FramedArtFulfillmentPayload = {
  sessionId: string;
  originalImageUrl: string;
  originalPublicId: string | null;
  /** Print-ready illustration URL (no watermark). */
  printImageUrl: string;
  printPublicId: string | null;
  style: StyleType;
};

export function resolveFramedArtFulfillment(
  session: FramedArtSession,
  sessionId: string,
  style: StyleType,
): { ok: true; data: FramedArtFulfillmentPayload } | { ok: false; error: string } {
  if (!session.originalUrl) {
    return { ok: false, error: "Original image is missing" };
  }

  const candidate =
    getCandidateForStyle(session, style) ?? resolveSelectedCandidate(session);

  const printImageUrl = candidate?.croppedCleanUrl ?? candidate?.cleanUrl;
  if (!printImageUrl) {
    return {
      ok: false,
      error:
        "Print-ready image is not available yet. Please wait for generation to finish.",
    };
  }

  const originalPublicId =
    session.originalPublicId ??
    publicIdFromCloudinaryUrl(session.originalUrl);
  const printPublicId =
    candidate?.croppedCleanPublicId ??
    candidate?.cleanPublicId ??
    publicIdFromCloudinaryUrl(printImageUrl);

  return {
    ok: true,
    data: {
      sessionId,
      originalImageUrl: session.originalUrl,
      originalPublicId,
      printImageUrl,
      printPublicId,
      style,
    },
  };
}

function shopifyLineAttr(
  key: string,
  value: string | null | undefined,
): { key: string; value: string } | null {
  if (!value) {
    return null;
  }
  if (value.length > SHOPIFY_LINE_ATTRIBUTE_MAX_LENGTH) {
    return null;
  }
  return { key, value };
}

/** Line properties copied to Shopify orders for admin / fulfillment. */
export function framedArtShopifyLineAttributes(
  fulfillment: FramedArtFulfillmentPayload,
  lineUid: string,
): Array<{ key: string; value: string }> {
  const attrs = [
    { key: "_uid", value: lineUid },
    { key: "_line_group", value: lineUid },
    { key: "_product_type", value: "framed_art" },
    { key: "_framed_art_session_id", value: fulfillment.sessionId },
    shopifyLineAttr("_original_public_id", fulfillment.originalPublicId),
    shopifyLineAttr("_print_public_id", fulfillment.printPublicId),
    shopifyLineAttr("_original_image", fulfillment.originalImageUrl),
    shopifyLineAttr("_image", fulfillment.printImageUrl),
    { key: "_style", value: fulfillment.style },
    { key: "style", value: fulfillment.style },
  ];

  return attrs.filter(
    (entry): entry is { key: string; value: string } => entry !== null,
  );
}
