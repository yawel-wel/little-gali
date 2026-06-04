/** Base GID for matching (strips ?cart= / ?key= query params Shopify appends). */
export function cartLineIdKey(lineId: string): string {
  const trimmed = lineId.trim();
  const base = trimmed.split("?")[0]?.split("#")[0] ?? trimmed;
  if (base.startsWith("gid://shopify/CartLine/")) {
    return base;
  }
  if (/^\d+$/.test(base)) {
    return `gid://shopify/CartLine/${base}`;
  }
  return base;
}

/** Ensure cart line IDs are valid Shopify CartLine GIDs for mutations. */
export function normalizeCartLineId(lineId: string): string {
  const trimmed = lineId.trim();
  if (trimmed.startsWith("gid://shopify/CartLine/")) {
    return trimmed;
  }
  if (trimmed.startsWith("gid://")) {
    return trimmed;
  }
  if (/^\d+$/.test(trimmed)) {
    return `gid://shopify/CartLine/${trimmed}`;
  }
  return trimmed;
}

export function normalizeCartLineIds(lineIds: string[]): string[] {
  return lineIds.map(normalizeCartLineId);
}
