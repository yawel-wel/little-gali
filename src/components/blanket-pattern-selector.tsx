"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/CartContext";
import { BLANKET_PRICE } from "@/lib/constants";
import {
  BLANKET_PATTERNS,
  BLANKET_PATTERN_LABEL_KEYS,
  BLANKET_PRODUCT_IMAGES,
  BLANKET_SWATCH_IMAGES,
  DEFAULT_BLANKET_PATTERN,
  type BlanketPattern,
} from "@/lib/blanket";
import { cn } from "@/lib/utils";

export type BlanketPatternSelectorProps = {
  pattern?: BlanketPattern;
  onPatternChange?: (pattern: BlanketPattern) => void;
  showUpsellTitle?: boolean;
  showAddToCart?: boolean;
  showPrice?: boolean;
  linkNameToPdp?: boolean;
  className?: string;
};

export function BlanketPatternSelector({
  pattern: controlledPattern,
  onPatternChange,
  showUpsellTitle = false,
  showAddToCart = false,
  showPrice = true,
  linkNameToPdp = true,
  className,
}: BlanketPatternSelectorProps) {
  const { t, locale } = useLanguage();
  const { addBlanketToCart } = useCart();
  const isHe = locale === "he";
  const [uncontrolledPattern, setUncontrolledPattern] =
    useState<BlanketPattern>(DEFAULT_BLANKET_PATTERN);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isControlled = controlledPattern !== undefined;
  const pattern = isControlled ? controlledPattern : uncontrolledPattern;

  const setPattern = (next: BlanketPattern) => {
    if (!isControlled) {
      setUncontrolledPattern(next);
    }
    onPatternChange?.(next);
  };

  const handleAdd = async () => {
    if (isAdding) return;
    setIsAdding(true);
    setError(null);
    try {
      await addBlanketToCart(pattern);
    } catch {
      setError(t("cart.addBlanketFailed"));
    } finally {
      setIsAdding(false);
    }
  };

  const nameText = `${t("product.blanket.name")} - ${t(BLANKET_PATTERN_LABEL_KEYS[pattern])}`;

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border border-[#D9CFC4] px-3 pb-3",
        showUpsellTitle ? "pt-4" : "pt-3",
        className,
      )}
      dir={isHe ? "rtl" : "ltr"}
    >
      {showUpsellTitle ? (
        <div className="absolute -top-2.5 inset-x-0 flex justify-center">
          <span className="bg-white px-2 font-body-bold text-xs uppercase tracking-wide text-dark-gray">
            {t("product.blanket.upsellTitle")}
          </span>
        </div>
      ) : null}

      <div className="flex items-stretch gap-3">
        <div className="relative w-[4.75rem] shrink-0 overflow-hidden rounded-md bg-[#F3EEE8] sm:w-[5.5rem]">
          <Image
            src={BLANKET_PRODUCT_IMAGES[pattern]}
            alt={nameText}
            fill
            className="object-cover"
            sizes="88px"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {linkNameToPdp ? (
            <Link
              href="/bamboo-blanket"
              className="cursor-pointer font-body-bold text-sm leading-snug text-dark-gray sm:text-[15px]"
            >
              {nameText}
            </Link>
          ) : (
            <p className="font-body-bold text-sm leading-snug text-dark-gray sm:text-[15px]">
              {nameText}
            </p>
          )}
          {showPrice ? (
            <p
              className="mt-0.5 font-heading text-[15px] font-bold leading-none text-dark-gray"
              dir="ltr"
            >
              <span className="text-sm">₪</span>
              {BLANKET_PRICE}
            </p>
          ) : null}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {BLANKET_PATTERNS.map((option) => {
              const selected = pattern === option;
              const label = t(BLANKET_PATTERN_LABEL_KEYS[option]);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPattern(option)}
                  aria-pressed={selected}
                  aria-label={t("product.blanket.patternAria").replace(
                    "{pattern}",
                    label,
                  )}
                  className={cn(
                    "relative size-7 cursor-pointer overflow-hidden rounded-md bg-white p-0.5 transition-colors",
                    selected
                      ? "border-2 border-[#2d3748]"
                      : "border border-[#E8DFD4] hover:border-primary-orange/60",
                  )}
                >
                  <Image
                    src={BLANKET_SWATCH_IMAGES[option]}
                    alt={label}
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showAddToCart ? (
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={isAdding}
          className="mt-2 w-full cursor-pointer rounded-md bg-[#F3EEE8] px-3 py-1.5 font-body-bold text-xs uppercase tracking-wide text-dark-gray transition hover:bg-[#E8DFD4] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAdding
            ? t("product.blanket.addingToCart")
            : t("product.blanket.addToCart")}
        </button>
      ) : null}

      {error ? (
        <p className="mt-1 font-body text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

/** Soft-book upsell: title + add-to-cart (uncontrolled pattern). */
export function SoftBookBlanketUpsell() {
  return (
    <BlanketPatternSelector showUpsellTitle showAddToCart linkNameToPdp />
  );
}
