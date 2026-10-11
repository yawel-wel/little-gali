import {
  birthPackageShopifyAttributes,
  bookColorFromLineAttributes,
  isBirthPackageFromAttributes,
  isBirthPackageVariantId,
} from "@/lib/birth-package";
import { matchingBlanketPattern } from "@/lib/blanket";
import { bookColorFromVariantId, resolveBookVariantGid } from "@/lib/book-color";
import { migrateCartImagesToLine } from "@/lib/cart-images-migrate";
import { saveCartImages } from "@/lib/cart-images-store";
import { birthPackageVariantGid } from "@/lib/constants";
import { framedArtVariantGid } from "@/lib/framed-art/fulfillment";
import { SHOPIFY_LINE_ATTRIBUTE_MAX_LENGTH } from "@/lib/preview-session/cloudinary";
import { nudgeShopifyCartDiscounts } from "@/lib/shopify/nudge-cart-discounts";
import {
  fetchCartLinesForUpdate,
  findLineByKey,
  shopifyGraphql,
  type ShopifyAttribute,
  type ShopifyCartLineNode,
  type ShopifyCartSnapshot,
} from "@/lib/shopify/update-cart-line-quantity";

/** Expected refusal (wrong line, already upgraded, ...): routes answer 400. */
export class BookUpsellError extends Error {}

/** Attributes that describe the gift set or the line identity; rewritten on upgrade. */
const GIFT_SET_REWRITTEN_KEYS = new Set([
  "_product_type",
  "_blanket_pattern",
  "_pattern",
  "_book_color",
  "_uid",
  "_line_group",
]);

function shopifyCredentials(): { storeDomain: string; accessToken: string } {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!storeDomain || !accessToken) {
    throw new Error("Shopify credentials not configured");
  }
  return { storeDomain, accessToken };
}

function isHttpUrl(value: string | undefined): value is string {
  return Boolean(value && /^https?:\/\//.test(value));
}

function newLineUid(): string {
  return Math.random().toString(36).slice(2);
}

function findLineByUid(
  lines: ShopifyCartLineNode[],
  uid: string,
): ShopifyCartLineNode | undefined {
  return lines.find((line) =>
    line.attributes?.some((a) => a.key === "_uid" && a.value === uid),
  );
}

async function loadCartLine(
  storeDomain: string,
  accessToken: string,
  cartId: string,
  lineId: string,
): Promise<{ cart: ShopifyCartSnapshot; line: ShopifyCartLineNode }> {
  const cart = await fetchCartLinesForUpdate(storeDomain, accessToken, cartId);
  const line = findLineByKey(cart.lines, lineId);
  if (!line) {
    throw new BookUpsellError("Cart line not found");
  }
  return { cart, line };
}

/**
 * Turns one soft-book line into a gift-set line (book + blanket matching the book color),
 * keeping its images and attributes. The price comes from the gift-set variant.
 */
export async function upgradeBookLineToGiftSet(
  cartId: string,
  lineId: string,
): Promise<ShopifyCartSnapshot> {
  const { storeDomain, accessToken } = shopifyCredentials();
  const { cart, line } = await loadCartLine(
    storeDomain,
    accessToken,
    cartId,
    lineId,
  );

  const bookColor = bookColorFromVariantId(line.merchandise?.id);
  if (!bookColor || isBirthPackageFromAttributes(line.attributes)) {
    throw new BookUpsellError("Line is not a soft book");
  }

  const blanketPattern = matchingBlanketPattern(bookColor);
  // New group: if the book had extra copies, only this unit becomes a gift set.
  const uid = newLineUid();
  const attributes: ShopifyAttribute[] = [
    ...(line.attributes ?? [])
      .filter((a) => !GIFT_SET_REWRITTEN_KEYS.has(a.key))
      .map((a) => ({ key: a.key, value: a.value })),
    { key: "_uid", value: uid },
    { key: "_line_group", value: uid },
    ...birthPackageShopifyAttributes({
      isBirthPackage: true,
      blanketPattern,
      bookColor,
    }),
  ];

  const data = await shopifyGraphql<{
    cartLinesUpdate: { userErrors: Array<{ message: string }> };
  }>(
    storeDomain,
    accessToken,
    `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { id }
        userErrors { message }
      }
    }
  `,
    {
      cartId: cart.id,
      lines: [
        {
          id: line.id,
          merchandiseId: birthPackageVariantGid(blanketPattern),
          quantity: 1,
          attributes,
        },
      ],
    },
  );
  const userErrors = data.cartLinesUpdate.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(userErrors[0]?.message || "Gift set upgrade failed");
  }

  const after = await fetchCartLinesForUpdate(storeDomain, accessToken, cart.id);
  const upgraded = findLineByUid(after.lines, uid);
  if (!upgraded || !isBirthPackageVariantId(upgraded.merchandise?.id)) {
    throw new Error("Gift set upgrade did not apply");
  }

  // Shopify may issue a new line id when merchandise changes; keep the stored images.
  await migrateCartImagesToLine(cart.id, line.id, upgraded.id);
  await nudgeShopifyCartDiscounts(cart.id);

  return fetchCartLinesForUpdate(storeDomain, accessToken, cart.id);
}

/**
 * Reverse of the upgrade: a gift-set line becomes a plain soft book again, keeping
 * its images and attributes (the customer removed the blanket).
 */
export async function downgradeGiftSetToBook(
  cartId: string,
  lineId: string,
): Promise<ShopifyCartSnapshot> {
  const { storeDomain, accessToken } = shopifyCredentials();
  const { cart, line } = await loadCartLine(
    storeDomain,
    accessToken,
    cartId,
    lineId,
  );

  if (!isBirthPackageVariantId(line.merchandise?.id)) {
    throw new BookUpsellError("Line is not a gift set");
  }
  const bookColor = bookColorFromLineAttributes(line.attributes);
  if (!bookColor) {
    throw new BookUpsellError("Gift set has no book color");
  }

  const uid = newLineUid();
  const attributes: ShopifyAttribute[] = [
    ...(line.attributes ?? [])
      .filter((a) => !GIFT_SET_REWRITTEN_KEYS.has(a.key))
      .map((a) => ({ key: a.key, value: a.value })),
    { key: "_uid", value: uid },
    { key: "_line_group", value: uid },
  ];

  const data = await shopifyGraphql<{
    cartLinesUpdate: { userErrors: Array<{ message: string }> };
  }>(
    storeDomain,
    accessToken,
    `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { id }
        userErrors { message }
      }
    }
  `,
    {
      cartId: cart.id,
      lines: [
        {
          id: line.id,
          merchandiseId: resolveBookVariantGid(bookColor),
          quantity: 1,
          attributes,
        },
      ],
    },
  );
  const userErrors = data.cartLinesUpdate.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(userErrors[0]?.message || "Remove blanket failed");
  }

  const after = await fetchCartLinesForUpdate(storeDomain, accessToken, cart.id);
  const downgraded = findLineByUid(after.lines, uid);
  if (!downgraded || bookColorFromVariantId(downgraded.merchandise?.id) === null) {
    throw new Error("Remove blanket did not apply");
  }

  await migrateCartImagesToLine(cart.id, line.id, downgraded.id);
  await nudgeShopifyCartDiscounts(cart.id);

  return fetchCartLinesForUpdate(storeDomain, accessToken, cart.id);
}

/**
 * Adds a framed art line printed from one of a book line's color illustrations.
 * Image URLs are read from the book line on Shopify, never taken from the client.
 */
export async function addFramedArtFromBookLine(
  cartId: string,
  lineId: string,
  imageIndex: number,
): Promise<ShopifyCartSnapshot> {
  const { storeDomain, accessToken } = shopifyCredentials();
  const { cart, line } = await loadCartLine(
    storeDomain,
    accessToken,
    cartId,
    lineId,
  );

  const isBook =
    bookColorFromVariantId(line.merchandise?.id) !== null ||
    isBirthPackageVariantId(line.merchandise?.id);
  if (!isBook || !Number.isInteger(imageIndex) || imageIndex < 0) {
    throw new BookUpsellError("Invalid book line or image");
  }

  const attrs = new Map((line.attributes ?? []).map((a) => [a.key, a.value]));
  const slot = imageIndex + 1;
  const printImageUrl = attrs.get(`_color_image_${slot}`);
  if (!isHttpUrl(printImageUrl)) {
    throw new BookUpsellError("Color image not found on book line");
  }
  const originalImageUrl = attrs.get(`_original_${slot}`);
  const previewSessionId = attrs.get("_preview_session_id");
  const promptVersion = attrs
    .get("_color_image_prompt_versions")
    ?.split(",")[imageIndex];

  const optional = (key: string, value: string | undefined) =>
    value && value.length <= SHOPIFY_LINE_ATTRIBUTE_MAX_LENGTH
      ? [{ key, value }]
      : [];
  const uid = newLineUid();
  // Same keys the framed art flow writes, so the admin processes it as framed art.
  const attributes: ShopifyAttribute[] = [
    { key: "_uid", value: uid },
    { key: "_line_group", value: uid },
    { key: "_product_type", value: "framed_art" },
    { key: "_image", value: printImageUrl },
    ...optional(
      "_original_image",
      isHttpUrl(originalImageUrl) ? originalImageUrl : undefined,
    ),
    ...optional("_style", attrs.get("_style")),
    ...optional("_image_prompt_version", promptVersion),
    ...optional("_preview_session_id", previewSessionId),
  ];

  const data = await shopifyGraphql<{
    cartLinesAdd: { userErrors: Array<{ message: string }> };
  }>(
    storeDomain,
    accessToken,
    `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { id }
        userErrors { message }
      }
    }
  `,
    {
      cartId: cart.id,
      lines: [{ merchandiseId: framedArtVariantGid(), quantity: 1, attributes }],
    },
  );
  const userErrors = data.cartLinesAdd.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(userErrors[0]?.message || "Add framed art failed");
  }

  const added = findLineByUid(
    (await fetchCartLinesForUpdate(storeDomain, accessToken, cart.id)).lines,
    uid,
  );
  if (!added) {
    throw new Error("Framed art line not found after add");
  }

  await saveCartImages(cart.id, added.id, {
    productType: "framed_art",
    framedImageUrl: printImageUrl,
    imageUrls: [printImageUrl],
    originalUrls: isHttpUrl(originalImageUrl) ? [originalImageUrl] : undefined,
    previewSessionId,
  });
  await nudgeShopifyCartDiscounts(cart.id);

  return fetchCartLinesForUpdate(storeDomain, accessToken, cart.id);
}
