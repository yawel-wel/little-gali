const ADDING_TO_CART_KEY = "adding_to_cart";
const ADDING_TO_CART_STARTED_AT_KEY = "adding_to_cart_started_at";
const ADDING_TO_CART_MAX_AGE_MS = 30_000;

export function markAddingToCart(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADDING_TO_CART_KEY, "1");
  sessionStorage.setItem(ADDING_TO_CART_STARTED_AT_KEY, String(Date.now()));
}

export function clearAddingToCart(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ADDING_TO_CART_KEY);
  sessionStorage.removeItem(ADDING_TO_CART_STARTED_AT_KEY);
}

export function isAddingToCart(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(ADDING_TO_CART_KEY) !== "1") return false;

  const startedAt = Number(
    sessionStorage.getItem(ADDING_TO_CART_STARTED_AT_KEY),
  );
  const isFresh =
    Number.isFinite(startedAt) &&
    startedAt > 0 &&
    Date.now() - startedAt < ADDING_TO_CART_MAX_AGE_MS;

  if (!isFresh) {
    clearAddingToCart();
  }

  return isFresh;
}
