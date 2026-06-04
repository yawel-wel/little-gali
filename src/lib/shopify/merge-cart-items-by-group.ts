import type { CartItem } from "@/lib/CartContext";
import {
  getLineGroupId,
  type CartLineLike,
} from "@/lib/shopify/cart-line-group";

/** One UI row per _line_group (sum quantities and line totals). */
export function mergeCartItemsByLineGroup(items: CartItem[]): CartItem[] {
  const ungrouped: CartItem[] = [];
  const groups = new Map<string, CartItem[]>();

  for (const item of items) {
    const lineLike: CartLineLike = {
      id: item.lineId ?? item.id,
      quantity: item.quantity,
      attributes: (item as CartItem & { attributes?: CartLineLike["attributes"] })
        .attributes,
    };
    const groupId = getLineGroupId(lineLike);
    if (!groupId) {
      ungrouped.push(item);
      continue;
    }
    const list = groups.get(groupId) ?? [];
    list.push(item);
    groups.set(groupId, list);
  }

  const merged: CartItem[] = [...ungrouped];

  for (const [, groupItems] of groups) {
    if (groupItems.length === 1) {
      merged.push(groupItems[0]);
      continue;
    }

    const first = groupItems[0];
    const quantity = groupItems.reduce(
      (sum, item) => sum + (item.quantity > 0 ? item.quantity : 1),
      0,
    );
    const lineTotalAmount = groupItems.reduce(
      (sum, item) => sum + (item.lineTotalAmount ?? 0),
      0,
    );
    const lineCompareAmount = groupItems.reduce(
      (sum, item) => sum + (item.lineCompareAmount ?? 0),
      0,
    );

    merged.push({
      ...first,
      quantity,
      lineTotalAmount: lineTotalAmount > 0 ? lineTotalAmount : undefined,
      lineCompareAmount:
        lineCompareAmount > 0 ? lineCompareAmount : undefined,
      lineIds: groupItems.map((item) => item.lineId ?? item.id),
      lineGroupId: getLineGroupId({
        id: first.lineId ?? first.id,
        quantity: first.quantity,
        attributes: (first as CartItem & { attributes?: CartLineLike["attributes"] })
          .attributes,
      }) ?? undefined,
    });
  }

  return merged;
}
