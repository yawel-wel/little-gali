"use client";

import { useSyncExternalStore } from "react";

const DEFAULT_MOBILE_MAX_WIDTH = 768;

function getServerSnapshot() {
  return false;
}

/** SSR-safe; never null — avoids Framer treating mobile as desktop on first paint. */
export function useIsMobile(maxWidth: number = DEFAULT_MOBILE_MAX_WIDTH): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("resize", onChange);
      return () => window.removeEventListener("resize", onChange);
    },
    () => window.innerWidth < maxWidth,
    getServerSnapshot,
  );
}
