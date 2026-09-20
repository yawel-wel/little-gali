"use client";

import { useEffect, useState } from "react";
import { isGiftSetFlow } from "@/lib/gift-set";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

export function useIsGiftSetFlow(): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isGiftSetFlow());
  }, []);

  return active;
}

export function GiftSetFlowBadge({ className }: { className?: string }) {
  const { t } = useLanguage();
  const isGiftSet = useIsGiftSetFlow();

  if (!isGiftSet) return null;

  return (
    <span
      className={cn(
        "inline-block w-fit rounded-full bg-[#F0DCC8] px-2.5 py-0.5 font-body-bold text-xs text-accent-burgundy",
        className,
      )}
    >
      {t("product.birthPackage.name")}
    </span>
  );
}
