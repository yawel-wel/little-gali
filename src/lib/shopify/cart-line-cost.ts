/** Storefront API CartLine.cost fields for GraphQL queries. */
export const CART_LINE_COST_FIELDS = `
  cost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
  }
`;

export type ShopifyLineCostInput = {
  totalAmount?: { amount?: string };
  subtotalAmount?: { amount?: string };
};

/** Parsed line price: `total` is after discounts; `compare` is pre-discount when lower. */
export function parseShopifyLineCost(
  cost: ShopifyLineCostInput | undefined,
): { total: number; compare?: number } | undefined {
  const total = parseFloat(cost?.totalAmount?.amount ?? "");
  if (!Number.isFinite(total)) {
    return undefined;
  }

  const subtotal = parseFloat(cost?.subtotalAmount?.amount ?? "");
  const compare =
    Number.isFinite(subtotal) && subtotal > total + 0.009 ? subtotal : undefined;

  return { total, compare };
}
