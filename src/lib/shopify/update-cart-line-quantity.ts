import { migrateCartImagesToLine } from "@/lib/cart-images-migrate";
import { SHOPIFY_CART_LINES_FIRST } from "@/lib/shopify/cart-lines-limit";
import { CART_LINE_COST_FIELDS } from "@/lib/shopify/cart-line-cost";
import {
  attributesForAdditionalUnit,
  findLinesInGroup,
  getLineGroupId,
  pickRepresentativeLine,
  totalQuantityInGroup,
} from "@/lib/shopify/cart-line-group";
import { cartLineIdKey } from "@/lib/shopify/normalize-cart-line-id";

type ShopifyAttribute = { key: string; value: string };

type ShopifyCartLineNode = {
  id: string;
  quantity: number;
  attributes?: ShopifyAttribute[];
  merchandise?: { id?: string };
};

type ShopifyCartSnapshot = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  totalAmount?: string;
  currencyCode?: string;
  lines: ShopifyCartLineNode[];
};

const CART_LINES_IN_RESPONSE = `
  lines(first: ${SHOPIFY_CART_LINES_FIRST}) {
    edges {
      node {
        id
        quantity
        attributes {
          key
          value
        }
        merchandise {
          ... on ProductVariant {
            id
          }
        }
        ${CART_LINE_COST_FIELDS}
      }
    }
  }
`;

function shopifyHeaders(accessToken: string) {
  return {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": accessToken,
  };
}

async function shopifyGraphql<T>(
  storeDomain: string,
  accessToken: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(
    `https://${storeDomain}/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: shopifyHeaders(accessToken),
      body: JSON.stringify({ query, variables }),
    },
  );
  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message || "Shopify API error");
  }
  return result.data as T;
}

function parseCartLines(
  cart: {
    lines?: {
      edges?: Array<{ node: ShopifyCartLineNode }>;
    };
  } | null,
): ShopifyCartLineNode[] {
  return cart?.lines?.edges?.map((edge) => edge.node).filter(Boolean) ?? [];
}

function snapshotFromCart(cart: {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost?: { totalAmount?: { amount?: string; currencyCode?: string } };
  lines?: { edges?: Array<{ node: ShopifyCartLineNode }> };
}): ShopifyCartSnapshot {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    totalAmount: cart.cost?.totalAmount?.amount,
    currencyCode: cart.cost?.totalAmount?.currencyCode,
    lines: parseCartLines(cart),
  };
}

function findLineByKey(
  lines: ShopifyCartLineNode[],
  lineId: string,
): ShopifyCartLineNode | undefined {
  const key = cartLineIdKey(lineId);
  return lines.find((line) => cartLineIdKey(line.id) === key);
}

export async function fetchCartLinesForUpdate(
  storeDomain: string,
  accessToken: string,
  cartId: string,
): Promise<ShopifyCartSnapshot> {
  const cartQuery = `
    query cartLinesForUpdate($id: ID!) {
      cart(id: $id) {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        ${CART_LINES_IN_RESPONSE}
      }
    }
  `;

  const cartData = await shopifyGraphql<{
    cart: {
      id: string;
      checkoutUrl: string;
      totalQuantity: number;
      cost?: { totalAmount?: { amount?: string; currencyCode?: string } };
      lines?: { edges?: Array<{ node: ShopifyCartLineNode }> };
    } | null;
  }>(storeDomain, accessToken, cartQuery, { id: cartId });

  if (!cartData.cart?.id) {
    throw new Error("Cart not found");
  }

  return snapshotFromCart(cartData.cart);
}

async function removeCartLines(
  storeDomain: string,
  accessToken: string,
  cartId: string,
  lineIds: string[],
): Promise<void> {
  if (lineIds.length === 0) {
    return;
  }

  const removeData = await shopifyGraphql<{
    cartLinesRemove: {
      userErrors: Array<{ message: string }>;
    };
  }>(
    storeDomain,
    accessToken,
    `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { id }
        userErrors { message }
      }
    }
  `,
    { cartId, lineIds },
  );

  const removeErrors = removeData.cartLinesRemove.userErrors ?? [];
  if (removeErrors.length > 0) {
    throw new Error(removeErrors[0]?.message || "Failed to remove cart line");
  }
}

async function runCartLinesUpdateQuantityOnly(
  storeDomain: string,
  accessToken: string,
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<void> {
  const updateData = await shopifyGraphql<{
    cartLinesUpdate: {
      userErrors: Array<{ message: string }>;
      warnings?: Array<{ message: string }>;
    };
  }>(
    storeDomain,
    accessToken,
    `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { id }
        userErrors { message }
        warnings { message }
      }
    }
  `,
    {
      cartId,
      lines: [{ id: lineId, quantity }],
    },
  );

  const userErrors = updateData.cartLinesUpdate.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(userErrors[0]?.message || "Cart update failed");
  }

  const warnings = updateData.cartLinesUpdate.warnings ?? [];
  if (warnings.length > 0) {
    console.warn(
      "cartLinesUpdate warnings:",
      warnings.map((w) => w.message).join("; "),
    );
  }
}

async function addCartLine(
  storeDomain: string,
  accessToken: string,
  cartId: string,
  merchandiseId: string,
  attributes: ShopifyAttribute[],
): Promise<ShopifyCartLineNode> {
  const addData = await shopifyGraphql<{
    cartLinesAdd: {
      cart: {
        lines?: { edges?: Array<{ node: ShopifyCartLineNode }> };
      } | null;
      userErrors: Array<{ message: string }>;
    };
  }>(
    storeDomain,
    accessToken,
    `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_LINES_IN_RESPONSE}
        }
        userErrors { message }
      }
    }
  `,
    {
      cartId,
      lines: [{ merchandiseId, quantity: 1, attributes }],
    },
  );

  const addErrors = addData.cartLinesAdd.userErrors ?? [];
  if (addErrors.length > 0) {
    throw new Error(addErrors[0]?.message || "Failed to add cart line");
  }

  const lines = parseCartLines(addData.cartLinesAdd.cart);
  const uid = attributes.find((a) => a.key === "_uid")?.value;
  const added =
    (uid
      ? lines.find((line) =>
          line.attributes?.some(
            (a) => a.key === "_uid" && a.value === uid,
          ),
        )
      : undefined) ?? lines[lines.length - 1];

  if (!added?.id) {
    throw new Error("Failed to find added cart line");
  }

  return added;
}

/**
 * Books / framed art: Shopify often won't set qty > 1 on one customized line.
 * Add one line per unit (qty 1 each) sharing _line_group — same idea as Ajax cart/update.js line keys.
 */
async function adjustGroupQuantity(
  storeDomain: string,
  accessToken: string,
  cartId: string,
  groupId: string,
  preferLineId: string,
  targetQuantity: number,
  templateLine: ShopifyCartLineNode,
  templateAttributes: ShopifyAttribute[],
): Promise<{ clonedLineIds: string[] }> {
  const clonedLineIds: string[] = [];
  let cart = await fetchCartLinesForUpdate(storeDomain, accessToken, cartId);
  let current = totalQuantityInGroup(cart.lines, groupId);

  while (current < targetQuantity) {
    const attrs = attributesForAdditionalUnit(templateAttributes);
    const merchandiseId = templateLine.merchandise?.id;
    if (!merchandiseId) {
      throw new Error("Cannot add cart line without merchandise id");
    }

    const added = await addCartLine(
      storeDomain,
      accessToken,
      cartId,
      merchandiseId,
      attrs,
    );
    clonedLineIds.push(added.id);
    cart = await fetchCartLinesForUpdate(storeDomain, accessToken, cartId);
    current = totalQuantityInGroup(cart.lines, groupId);
  }

  while (current > targetQuantity) {
    const inGroup = findLinesInGroup(cart.lines, groupId);
    const preferKey = cartLineIdKey(preferLineId);
    const removable =
      inGroup.find((line) => cartLineIdKey(line.id) !== preferKey) ??
      inGroup[inGroup.length - 1];

    if (!removable) {
      throw new Error("Cannot reduce cart line quantity");
    }

    await removeCartLines(storeDomain, accessToken, cartId, [removable.id]);
    cart = await fetchCartLinesForUpdate(storeDomain, accessToken, cartId);
    current = totalQuantityInGroup(cart.lines, groupId);
  }

  return { clonedLineIds };
}

export async function updateCartLineQuantity(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<{
  cart: ShopifyCartSnapshot;
  sourceLineId: string;
  updatedLineId: string;
  updatedQuantity: number;
  replacedLine: boolean;
  clonedLineIds: string[];
}> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!storeDomain || !accessToken) {
    throw new Error("Shopify credentials not configured");
  }

  const before = await fetchCartLinesForUpdate(
    storeDomain,
    accessToken,
    cartId,
  );
  const existingLine = findLineByKey(before.lines, lineId);

  if (!existingLine) {
    throw new Error("Cart line not found");
  }

  const templateAttributes = (existingLine.attributes ?? []).map((attr) => ({
    key: attr.key,
    value: attr.value,
  }));

  const shopifyCartId = before.id;
  const groupId = getLineGroupId(existingLine);
  let clonedLineIds: string[] = [];
  let replacedLine = false;

  if (groupId) {
    const { clonedLineIds: added } = await adjustGroupQuantity(
      storeDomain,
      accessToken,
      shopifyCartId,
      groupId,
      lineId,
      quantity,
      existingLine,
      templateAttributes,
    );
    clonedLineIds = added;
    replacedLine = added.length > 0;
  } else {
    await runCartLinesUpdateQuantityOnly(
      storeDomain,
      accessToken,
      shopifyCartId,
      existingLine.id,
      quantity,
    );
  }

  const after = await fetchCartLinesForUpdate(
    storeDomain,
    accessToken,
    shopifyCartId,
  );

  if (groupId) {
    const total = totalQuantityInGroup(after.lines, groupId);
    if (total !== quantity) {
      throw new Error(
        `Quantity update did not apply (expected ${quantity}, got ${total})`,
      );
    }
    const updatedLine = pickRepresentativeLine(after.lines, groupId, lineId);
    if (!updatedLine) {
      throw new Error("Updated cart line missing after quantity change");
    }

    for (const clonedId of clonedLineIds) {
      await migrateCartImagesToLine(cartId, existingLine.id, clonedId);
    }

    return {
      cart: after,
      sourceLineId: existingLine.id,
      updatedLineId: updatedLine.id,
      updatedQuantity: quantity,
      replacedLine,
      clonedLineIds,
    };
  }

  const updatedLine = findLineByKey(after.lines, lineId);
  if (!updatedLine || updatedLine.quantity !== quantity) {
    throw new Error(
      `Quantity update did not apply (expected ${quantity}, got ${updatedLine?.quantity ?? 0})`,
    );
  }

  return {
    cart: after,
    sourceLineId: existingLine.id,
    updatedLineId: updatedLine.id,
    updatedQuantity: quantity,
    replacedLine: false,
    clonedLineIds: [],
  };
}
