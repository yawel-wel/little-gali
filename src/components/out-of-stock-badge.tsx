"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

type OutOfStockBadgeProps = {
  className?: string;
};

/** Small "נגמר המלאי" pill for sold-out color / print options. */
export function OutOfStockBadge({ className }: OutOfStockBadgeProps) {
  const { t } = useLanguage();
  return (
    <span
      className={cn(
        "pointer-events-none inline-block w-fit whitespace-nowrap rounded-full bg-accent-burgundy px-1.5 py-0.5 font-body-bold text-[10px] leading-none text-white",
        className,
      )}
    >
      {t("product.outOfStock")}
    </span>
  );
}
