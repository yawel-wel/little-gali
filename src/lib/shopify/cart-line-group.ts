import { cartLineIdKey } from "@/lib/shopify/normalize-cart-line-id";

export type CartLineAttributes = Array<{ key: string; value: string }>;

export type CartLineLike = {
  id: string;
  quantity: number;
  attributes?: CartLineAttributes;
};

/** Stable group id for quantity +/- (multiple Shopify lines, qty 1 each). */
export function getLineGroupId(line: CartLineLike): string | null {
  const attrs = line.attributes ?? [];
  const explicit = attrs.find((a) => a.key === "_line_group")?.value;
  if (explicit) {
    return explicit;
  }

  if (attrs.some((a) => a.key === "_type" && a.value === "gift_card")) {
    return null;
  }

  const isFramedArt = attrs.some(
    (a) => a.key === "_product_type" && a.value === "framed_art",
  );
  const isBook = attrs.some(
    (a) => a.key === "_image_1" || a.key === "image_1",
  );
  const uid = attrs.find((a) => a.key === "_uid")?.value;
  if (uid && (isFramedArt || isBook)) {
    return uid;
  }

  return null;
}

export function findLinesInGroup(
  lines: CartLineLike[],
  groupId: string,
): CartLineLike[] {
  return lines.filter((line) => getLineGroupId(line) === groupId);
}

export function totalQuantityInGroup(
  lines: CartLineLike[],
  groupId: string,
): number {
  return findLinesInGroup(lines, groupId).reduce(
    (sum, line) => sum + (line.quantity > 0 ? line.quantity : 0),
    0,
  );
}

export function pickRepresentativeLine(
  lines: CartLineLike[],
  groupId: string,
  preferLineId: string,
): CartLineLike | undefined {
  const inGroup = findLinesInGroup(lines, groupId);
  const key = cartLineIdKey(preferLineId);
  return (
    inGroup.find((line) => cartLineIdKey(line.id) === key) ?? inGroup[0]
  );
}

export function lineIdsInGroup(
  lines: CartLineLike[],
  groupId: string,
): string[] {
  return findLinesInGroup(lines, groupId).map((line) => line.id);
}

/** New Shopify line: same customization, new _uid, shared _line_group. */
export function attributesForAdditionalUnit(
  attributes: CartLineAttributes,
): CartLineAttributes {
  const newUid = Math.random().toString(36).slice(2);
  const groupId =
    attributes.find((a) => a.key === "_line_group")?.value ??
    attributes.find((a) => a.key === "_uid")?.value ??
    newUid;

  const next = attributes
    .filter((a) => a.key !== "_uid" && a.key !== "_line_group")
    .map((a) => ({ key: a.key, value: a.value }));

  next.push({ key: "_uid", value: newUid });
  next.push({ key: "_line_group", value: groupId });
  return next;
}

export function expandLineIdsToGroupMembers(
  lines: CartLineLike[],
  lineIds: string[],
): string[] {
  const expanded = new Set<string>();

  for (const lineId of lineIds) {
    const line = lines.find((l) => cartLineIdKey(l.id) === cartLineIdKey(lineId));
    if (!line) {
      expanded.add(lineId);
      continue;
    }
    const groupId = getLineGroupId(line);
    if (!groupId) {
      expanded.add(line.id);
      continue;
    }
    for (const id of lineIdsInGroup(lines, groupId)) {
      expanded.add(id);
    }
  }

  return [...expanded];
}
