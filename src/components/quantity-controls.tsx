"use client";

import { Plus, Minus, Trash } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface QuantityControlsProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function QuantityControls({
  quantity,
  onIncrease,
  onDecrease,
  onDelete,
  disabled = false,
}: QuantityControlsProps) {
  const { t } = useLanguage();
  const isQuantityOne = quantity === 1;

  const buttonClass =
    "flex h-5 w-5 shrink-0 items-center justify-center text-[#693430] transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40 md:cursor-pointer";

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (isQuantityOne) {
            onDelete();
          } else {
            onDecrease();
          }
        }}
        disabled={disabled}
        className={buttonClass}
        aria-label={
          isQuantityOne ? t("cart.removeItem") : t("cart.decreaseQuantity")
        }
      >
        {isQuantityOne ? (
          <Trash className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        ) : (
          <Minus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        )}
      </button>

      <span
        className="min-w-[1rem] text-center font-body-bold text-sm text-[#693430]"
        aria-live="polite"
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrease();
        }}
        disabled={disabled}
        className={buttonClass}
        aria-label={t("cart.increaseQuantity")}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
