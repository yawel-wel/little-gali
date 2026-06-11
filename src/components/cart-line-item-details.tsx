"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { cartLineHasDiscount } from "@/lib/cart-line-pricing";

type CartLineItemDetailsProps = {
  locale: string;
  colorValue?: string;
  colorSwatchSrc?: string;
  styleValue?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  showColorRow?: boolean;
  showStyleRow?: boolean;
  quantityControls?: ReactNode;
};

export function CartLineItemDetails({
  locale,
  colorValue,
  colorSwatchSrc,
  styleValue,
  quantity,
  unitPrice,
  lineTotal,
  showColorRow = true,
  showStyleRow = true,
  quantityControls,
}: CartLineItemDetailsProps) {
  const { t } = useLanguage();
  const isHe = locale === "he";
  const displayQuantity = quantity > 0 ? quantity : 1;
  const align = isHe ? "text-right" : "text-left";
  const dir = isHe ? "rtl" : "ltr";
  const showDiscount = cartLineHasDiscount(
    unitPrice,
    displayQuantity,
    lineTotal,
  );

  const rowClass = `text-sm font-body text-medium-gray ${align}`;

  return (
    <div className={`mt-3 space-y-0.5 ${align}`} dir={dir}>
      {showColorRow && colorValue && colorSwatchSrc ? (
        <p className={`${rowClass} flex items-center gap-1`}>
          <span className="shrink-0">{t("cart.colorLabel")}</span>
          <span className="inline-flex items-center gap-1.5 font-body leading-none text-dark-gray">
            <img
              src={colorSwatchSrc}
              alt=""
              className="h-4 w-4 shrink-0 rounded-full border border-[#cabcb3] object-cover"
            />
            <span>{colorValue}</span>
          </span>
        </p>
      ) : null}

      {showStyleRow && styleValue ? (
        <p className={rowClass}>
          {t("cart.styleLabel")}
          <span className="font-body text-dark-gray"> {styleValue}</span>
        </p>
      ) : null}

      <p className={rowClass}>
        {t("cart.quantity")}
        <span className="font-body text-dark-gray"> {displayQuantity}</span>
      </p>

      <p className={rowClass}>
        {t("cart.lineTotal")}{" "}
        <span className="font-body-bold text-dark-gray" dir="ltr">
          ₪ {Math.round(lineTotal)}
        </span>
      </p>

      {showDiscount ? (
        <p className={`text-sm font-body text-primary-orange ${align}`}>
          {t("cart.discountApplied")}
        </p>
      ) : null}

      {quantityControls ? (
        <div className="mt-3 flex w-full justify-end" dir="ltr">
          {quantityControls}
        </div>
      ) : null}
    </div>
  );
}
