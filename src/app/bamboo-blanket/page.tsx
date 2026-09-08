"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HomeCtaButton } from "@/components/home-cta-button";
import { BLANKET_PRICE } from "@/lib/constants";
import {
  BLANKET_PATTERNS,
  BLANKET_PATTERN_LABEL_KEYS,
  BLANKET_PRODUCT_GALLERY,
  BLANKET_SWATCH_IMAGES,
  DEFAULT_BLANKET_PATTERN,
  type BlanketPattern,
} from "@/lib/blanket";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/CartContext";
import { cn } from "@/lib/utils";

export default function BambooBlanketProductPage() {
  const { t, locale } = useLanguage();
  const { addBlanketToCart } = useCart();
  const isHe = locale === "he";
  const textAlign = isHe ? "text-right" : "text-left";
  const [imageIndex, setImageIndex] = useState(0);
  const [pattern, setPattern] = useState<BlanketPattern>(DEFAULT_BLANKET_PATTERN);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gallery = BLANKET_PRODUCT_GALLERY[pattern];
  const currentImageSrc = gallery[imageIndex] ?? gallery[0];

  const selectPattern = (next: BlanketPattern) => {
    setPattern(next);
    setImageIndex(0);
  };

  const galleryAlt = (index: number) =>
    t("product.blanket.gallery.imageAlt")
      .replace("{num}", String(index + 1))
      .replace("{pattern}", t(BLANKET_PATTERN_LABEL_KEYS[pattern]));

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

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header />

      <main
        id="main-content"
        className="flex-1"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}
      >
        <div className="container mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8">
          <nav
            aria-label={t("product.blanket.breadcrumbAria")}
            className={cn("py-4 text-sm font-body text-medium-gray", textAlign)}
          >
            <ol
              dir={isHe ? "rtl" : "ltr"}
              className="flex flex-wrap items-center gap-1.5"
            >
              <li>
                <Link href="/" className="hover:text-dark-gray transition-colors">
                  {t("product.blanket.breadcrumbHome")}
                </Link>
              </li>
              <li aria-hidden="true" className="text-light-gray">
                <span dir="ltr">{isHe ? "‹" : "›"}</span>
              </li>
              <li>
                <span className="text-dark-gray">
                  {t("product.blanket.breadcrumbProduct")}
                </span>
              </li>
            </ol>
          </nav>

          <div className="mx-auto w-full max-w-6xl min-w-0">
            <div className="grid w-full min-w-0 items-start gap-8 pb-12 lg:grid-cols-2 lg:gap-14">
              {/* Image gallery */}
              <div className="order-1 w-full min-w-0 lg:order-2 lg:sticky lg:top-[calc(72px+var(--banner-height,0px)+1.5rem)]">
                <div
                  className={cn(
                    "flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch",
                    isHe ? "sm:flex-row-reverse" : "",
                  )}
                >
                  <div className="relative order-1 w-full min-w-0 flex-1 sm:order-2">
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F3EEE8]">
                      <Image
                        src={currentImageSrc}
                        alt={galleryAlt(imageIndex)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        priority
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "order-2 flex w-full min-w-0 gap-2 overflow-x-auto pb-0.5 sm:order-1 sm:w-auto sm:flex-col sm:justify-start sm:overflow-visible",
                      isHe ? "flex-row-reverse sm:flex-col" : "",
                    )}
                    dir={isHe ? "rtl" : "ltr"}
                  >
                    {gallery.map((src, index) => {
                      const isActive = imageIndex === index;
                      return (
                        <button
                          key={`${pattern}-${src}-${index}`}
                          type="button"
                          onClick={() => setImageIndex(index)}
                          aria-label={galleryAlt(index)}
                          aria-pressed={isActive}
                          className={cn(
                            "relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-[#F3EEE8] sm:size-[4.5rem]",
                            isActive
                              ? "border-2 border-[#2d3748]"
                              : "border border-[#E8DFD4] hover:border-primary-orange/60",
                          )}
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="72px"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Product info */}
              <div
                className={cn(
                  "order-2 flex w-full min-w-0 max-w-full flex-col gap-5 lg:order-1",
                  textAlign,
                )}
              >
                <div className="order-1 space-y-1.5">
                  <h1 className="text-2xl font-heading font-bold leading-tight text-dark-gray sm:text-3xl lg:text-4xl">
                    {t("product.blanket.pdpName")}
                  </h1>
                </div>

                <div
                  className={cn("order-2 -my-3 flex items-baseline")}
                  dir={isHe ? "rtl" : "ltr"}
                >
                  <span
                    className="inline-flex items-baseline gap-0 font-heading font-bold text-dark-gray"
                    dir="ltr"
                  >
                    <span className="text-xl">₪</span>
                    <span className="text-3xl leading-none">{BLANKET_PRICE}</span>
                  </span>
                </div>

                <div className="order-4 w-full min-w-0 space-y-4 lg:order-3">
                  <p className="max-w-full whitespace-pre-line break-words font-body leading-snug text-medium-gray">
                    {t("product.blanket.description")}
                  </p>
                </div>

                {/* Pattern selector */}
                <div className="order-3 w-full min-w-0 space-y-2.5 lg:order-4">
                  <p className="text-sm font-body-bold text-dark-gray">
                    {t("product.blanket.colorLabel")}:{" "}
                    <span className="font-body text-medium-gray">
                      {t(BLANKET_PATTERN_LABEL_KEYS[pattern])}
                    </span>
                  </p>
                  <div
                    className="flex w-full flex-wrap justify-start gap-3"
                    dir={isHe ? "rtl" : "ltr"}
                  >
                    {BLANKET_PATTERNS.map((option) => {
                      const selected = pattern === option;
                      const label = t(BLANKET_PATTERN_LABEL_KEYS[option]);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => selectPattern(option)}
                          aria-pressed={selected}
                          aria-label={t("product.blanket.patternAria").replace(
                            "{pattern}",
                            label,
                          )}
                          className={cn(
                            "relative size-11 cursor-pointer overflow-hidden rounded-md bg-white p-0.5 transition-colors sm:size-12",
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
                            sizes="48px"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="order-5 w-full min-w-0 space-y-3 pt-2">
                  <HomeCtaButton
                    fullWidth
                    disabled={isAdding}
                    onClick={() => void handleAdd()}
                    sx={{
                      borderRadius: "5px",
                      px: { xs: 2.5, sm: 5 },
                      py: { xs: 1.25, sm: 1.75 },
                      fontSize: { xs: "0.9375rem", sm: "1rem" },
                    }}
                  >
                    {isAdding
                      ? t("product.blanket.addingToCart")
                      : t("product.blanket.addToCart")}
                  </HomeCtaButton>
                  {error ? (
                    <p className="font-body text-sm text-red-600">{error}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
