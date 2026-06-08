"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initMixpanel, track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { useCart } from "@/lib/CartContext";

export function MixpanelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cart } = useCart();
  const prevPathnameRef = useRef<string | null>(null);
  const abandonedTrackedRef = useRef(false);

  useEffect(() => {
    initMixpanel();
  }, []);

  useEffect(() => {
    const hasItems = Boolean(cart && cart.totalQuantity > 0);

    if (!hasItems) {
      abandonedTrackedRef.current = false;
      prevPathnameRef.current = pathname;
      return;
    }

    const prevPathname = prevPathnameRef.current;
    if (
      prevPathname &&
      prevPathname !== pathname &&
      !pathname.startsWith("/cart") &&
      !abandonedTrackedRef.current
    ) {
      track(ANALYTICS_EVENTS.CART_ABANDONED);
      abandonedTrackedRef.current = true;
    }

    prevPathnameRef.current = pathname;
  }, [pathname, cart]);

  return <>{children}</>;
}
