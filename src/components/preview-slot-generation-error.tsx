"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

type PreviewSlotGenerationErrorProps = {
  message: string;
  onRetry: () => void;
  disabled?: boolean;
};

export function PreviewSlotGenerationError({
  message,
  onRetry,
  disabled = false,
}: PreviewSlotGenerationErrorProps) {
  const { t } = useLanguage();

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col items-center justify-center gap-2 px-3 py-2 text-center md:gap-3 md:px-4">
      <p className="max-w-full font-body text-[10px] leading-snug text-dark-gray md:text-sm md:leading-relaxed">
        {message}
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onRetry();
        }}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-accent-burgundy bg-white px-2.5 py-1 font-body-bold text-[10px] whitespace-nowrap text-accent-burgundy transition-colors",
          "md:rounded-lg md:px-3 md:py-1.5 md:text-xs",
          "hover:bg-[#EFE7DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {t("preview.slotRetryAgain")}
      </button>
    </div>
  );
}
