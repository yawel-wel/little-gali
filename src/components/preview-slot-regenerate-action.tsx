"use client";

import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

type PreviewSlotRegenerateActionProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
  className?: string;
};

export function PreviewSlotRegenerateAction({
  disabled = false,
  isLoading = false,
  onClick,
  className,
}: PreviewSlotRegenerateActionProps) {
  const { t, locale } = useLanguage();
  const isRtl = locale === "he";

  return (
    <div
      dir="ltr"
      className={cn("flex w-full justify-center", className)}
    >
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={onClick}
        className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 font-body text-xs leading-relaxed text-medium-gray transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isRtl ? (
          <>
            <span dir="rtl">{t("preview.regenerateShort")}</span>
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                isLoading && "animate-spin",
              )}
              strokeWidth={2}
              aria-hidden
            />
          </>
        ) : (
          <>
            <span>{t("preview.regenerateShort")}</span>
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                isLoading && "animate-spin",
              )}
              strokeWidth={2}
              aria-hidden
            />
          </>
        )}
      </button>
    </div>
  );
}
