"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { cartLineHasDiscount } from "@/lib/cart-line-pricing";

type CartLineItemDetailsProps = {
  locale: string;
  styleValue?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  showStyleRow?: boolean;
  quantityControls?: ReactNode;
};

export function CartLineItemDetails({
  locale,
  styleValue,
  quantity,
  unitPrice,
  lineTotal,
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
