"use client";

import {
  BOOK_COLOR_SWATCHES,
  type BookColor,
} from "@/lib/book-color";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

const BOOK_COLORS: BookColor[] = ["light", "dark"];

const SWATCH_BORDER = "border border-[#cabcb3]";

type PreviewBookColorPickerProps = {
  selectedColor: BookColor | null;
  onSelectColor: (color: BookColor) => void;
  disabled?: boolean;
  errorMessage?: string;
};

export function PreviewBookColorPicker({
  selectedColor,
  onSelectColor,
  disabled = false,
  errorMessage,
}: PreviewBookColorPickerProps) {
  const { t } = useLanguage();

  return (
    <div className="mt-8 w-full max-w-3xl">
      <p className="mb-3 text-center font-body text-sm text-dark-gray/80">
        {t("preview.bookColor.title")}
      </p>
      <div className="flex gap-3" dir="rtl">
        {BOOK_COLORS.map((color) => {
          const isSelected = color === selectedColor;
          return (
            <button
              key={color}
              type="button"
              disabled={disabled}
              onClick={() => onSelectColor(color)}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-end gap-2 rounded-2xl bg-[#ebe6dc] px-3 py-3 transition-colors sm:gap-2.5 sm:px-4",
                isSelected
                  ? "border-2 border-primary-orange"
                  : SWATCH_BORDER,
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
              dir="ltr"
            >
              <span className="min-w-0 font-body text-sm leading-tight text-dark-gray">
                {t(`preview.bookColor.${color}`)}
              </span>
              <img
                src={BOOK_COLOR_SWATCHES[color]}
                alt=""
                className={cn(
                  "h-8 w-8 shrink-0 rounded-full object-cover",
                  SWATCH_BORDER,
                )}
              />
            </button>
          );
        })}
      </div>
      {errorMessage ? (
        <p className="mt-2 text-center font-body text-sm text-accent-burgundy">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
