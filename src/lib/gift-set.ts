import {
  DEFAULT_BLANKET_PATTERN,
  isBlanketPattern,
  type BlanketPattern,
} from "@/lib/blanket";

const GIFT_SET_FLOW_KEY = "lg_gift_set_flow";
const GIFT_SET_BLANKET_PATTERN_KEY = "lg_blanket_pattern";

export function isGiftSetFlow(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(GIFT_SET_FLOW_KEY) === "1";
  } catch {
    return false;
  }
}

export function setGiftSetFlow(active: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (active) {
      localStorage.setItem(GIFT_SET_FLOW_KEY, "1");
    } else {
      localStorage.removeItem(GIFT_SET_FLOW_KEY);
    }
  } catch {
    // ignore
  }
}

export function getGiftSetBlanketPattern(): BlanketPattern {
  if (typeof window === "undefined") return DEFAULT_BLANKET_PATTERN;
  try {
    const raw = localStorage.getItem(GIFT_SET_BLANKET_PATTERN_KEY);
    if (isBlanketPattern(raw)) return raw;
  } catch {
    // ignore
  }
  return DEFAULT_BLANKET_PATTERN;
}

export function setGiftSetBlanketPattern(pattern: BlanketPattern): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GIFT_SET_BLANKET_PATTERN_KEY, pattern);
  } catch {
    // ignore
  }
}

export function clearGiftSetFlow(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GIFT_SET_FLOW_KEY);
    localStorage.removeItem(GIFT_SET_BLANKET_PATTERN_KEY);
  } catch {
    // ignore
  }
}

/** Start gift-set purchase from birth-packages PDP. */
export function startGiftSetFlow(pattern: BlanketPattern): void {
  setGiftSetFlow(true);
  setGiftSetBlanketPattern(pattern);
}
