"use client";

import { useEffect, useState } from "react";

/** Avoid SSR/client mismatches for viewport-dependent UI (animations, column counts). */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
