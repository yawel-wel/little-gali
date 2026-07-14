import { getLineGroupId } from "@/lib/shopify/cart-line-group";
import { isValidBookCartImageCount } from "@/lib/preview-session/generation-stats";

type LineAttribute = { key: string; value: string };

const MAX_BOOK_IMAGE_SLOTS = 9;

export function extractImagesFromLineAttributes(
  attributes: LineAttribute[] | undefined,
  cartAttributes?: LineAttribute[],
): {
  imageUrls: string[];
  isFramedArt: boolean;
} {
  const imageUrls: string[] = [];
  const productTypeAttr = attributes?.find((a) => a.key === "_product_type");
  const isFramedArt = productTypeAttr?.value === "framed_art";

  if (isFramedArt) {
    const framedImage = attributes?.find((a) => a.key === "_image");
    if (framedImage?.value) {
      imageUrls.push(framedImage.value);
    }
  } else {
    for (let i = 1; i <= MAX_BOOK_IMAGE_SLOTS; i++) {
      const imageAttr = attributes?.find(
        (a) => a.key === `_image_${i}` || a.key === `image_${i}`,
      );
      if (imageAttr?.value) {
        imageUrls.push(imageAttr.value);
      }
    }
  }

  if (imageUrls.length === 0 && cartAttributes) {
    const bookImagesAttr = cartAttributes.find((a) => a.key === "_book_images");
    if (bookImagesAttr?.value) {
      try {
        const parsed = JSON.parse(bookImagesAttr.value);
        if (Array.isArray(parsed)) {
          imageUrls.push(...parsed);
        }
      } catch {
        // ignore
      }
    }
    if (imageUrls.length === 0) {
      for (let i = 1; i <= MAX_BOOK_IMAGE_SLOTS; i++) {
        const imageAttr = cartAttributes.find(
          (a) => a.key === `_image_${i}` || a.key === `image_${i}`,
        );
        if (imageAttr?.value) {
          imageUrls.push(imageAttr.value);
        }
      }
    }
  }

  return { imageUrls, isFramedArt };
}

export function extractColorUrlsFromAttributes(
  attributes: LineAttribute[] | undefined,
): string[] | undefined {
  if (!attributes) {
    return undefined;
  }
  const urls: string[] = [];
  for (let i = 1; i <= MAX_BOOK_IMAGE_SLOTS; i++) {
    const colorAttr = attributes.find((a) => a.key === `_color_image_${i}`);
    if (colorAttr?.value) {
      urls.push(colorAttr.value);
    }
  }
  return isValidBookCartImageCount(urls.length) ? urls : undefined;
}

/** One KV read per line group (cloned qty lines share the same images). */
export function representativeLineIdsForImageLoad(
  lines: Array<{ id: string; attributes?: LineAttribute[] }>,
): string[] {
  const ids: string[] = [];
  const seenGroups = new Set<string>();

  for (const line of lines) {
    const isGiftCard = line.attributes?.some(
      (a) => a.key === "_type" && a.value === "gift_card",
    );
    if (isGiftCard) {
      continue;
    }

    const groupId =
      getLineGroupId({
        id: line.id,
        quantity: 1,
        attributes: line.attributes,
      }) ?? line.id;

    if (seenGroups.has(groupId)) {
      continue;
    }
    seenGroups.add(groupId);
    ids.push(line.id);
  }

  return ids;
}
