import { randomUUID } from "crypto";
import { isR2Configured } from "./r2-config";
import { copyUrlToKey } from "./objects";
import {
  assertShopifyUrlLength,
  buildR2DeliveryUrl,
  publicIdFromStorageUrl,
} from "./urls";

function fulfillmentKey(sessionId: string, filename: string): string {
  return `little-gali/fulfillment/${sessionId}/${filename}`;
}

async function promoteUrl(
  sourceUrl: string,
  destKey: string,
): Promise<string> {
  const existingKey = publicIdFromStorageUrl(sourceUrl);
  if (existingKey === destKey || existingKey?.startsWith(`little-gali/fulfillment/`)) {
    return existingKey === destKey
      ? assertShopifyUrlLength(buildR2DeliveryUrl(existingKey))
      : assertShopifyUrlLength(sourceUrl);
  }
  const uploaded = await copyUrlToKey(sourceUrl, destKey);
  return assertShopifyUrlLength(uploaded.secureUrl);
}

export async function promoteBookCartImagesToFulfillment(input: {
  sessionId?: string;
  imageUrls: string[];
  originalUrls?: string[];
  generatedColorUrls?: string[];
}): Promise<{
  imageUrls: string[];
  originalUrls?: string[];
  generatedColorUrls?: string[];
}> {
  if (!isR2Configured()) {
    return input;
  }
  const sessionId = input.sessionId?.trim() || randomUUID();
  const imageUrls = await Promise.all(
    input.imageUrls.map((url, index) =>
      promoteUrl(url, fulfillmentKey(sessionId, `image_${index + 1}`)),
    ),
  );
  const originalUrls = input.originalUrls
    ? await Promise.all(
        input.originalUrls.map((url, index) =>
          promoteUrl(url, fulfillmentKey(sessionId, `original_${index + 1}`)),
        ),
      )
    : undefined;
  const generatedColorUrls = input.generatedColorUrls
    ? await Promise.all(
        input.generatedColorUrls.map((url, index) =>
          promoteUrl(url, fulfillmentKey(sessionId, `color_image_${index + 1}`)),
        ),
      )
    : undefined;
  return { imageUrls, originalUrls, generatedColorUrls };
}

export async function promoteFramedArtUrlsToFulfillment(input: {
  sessionId: string;
  originalImageUrl: string;
  printImageUrl: string;
  originalPublicId: string | null;
  printPublicId: string | null;
}): Promise<{
  originalImageUrl: string;
  printImageUrl: string;
  originalPublicId: string | null;
  printPublicId: string | null;
}> {
  if (!isR2Configured()) {
    return {
      originalImageUrl: input.originalImageUrl,
      printImageUrl: input.printImageUrl,
      originalPublicId: input.originalPublicId,
      printPublicId: input.printPublicId,
    };
  }
  const originalKey = fulfillmentKey(input.sessionId, "original");
  const printKey = fulfillmentKey(input.sessionId, "print");
  const [originalImageUrl, printImageUrl] = await Promise.all([
    promoteUrl(input.originalImageUrl, originalKey),
    promoteUrl(input.printImageUrl, printKey),
  ]);
  return {
    originalImageUrl,
    printImageUrl,
    originalPublicId: originalKey,
    printPublicId: printKey,
  };
}
