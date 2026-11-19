"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

type NewVersionBadgeProps = {
  className?: string;
};

/** "גרסה חדשה" pill for the new soft book version. */
export function NewVersionBadge({ className }: NewVersionBadgeProps) {
  const { t } = useLanguage();
  return (
    <span
      className={cn(
        "pointer-events-none inline-block w-fit whitespace-nowrap rounded-full border border-accent-burgundy bg-white px-2.5 py-1 font-body-bold text-xs leading-none text-accent-burgundy",
        className,
      )}
    >
      {t("product.newVersion")}
    </span>
  );
}
