"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MuiButton from "@mui/material/Button";
import { motion } from "framer-motion";
import { Title } from "@/components/title";
import {
  FRAMED_ART_THREE_PRICE,
  FRAMED_ART_TWO_PRICE,
  FRAMED_ART_UNIT_PRICE,
} from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const easeOwlet = [0.16, 1, 0.3, 1] as const;

/** Place in public/: framed-art-carousel-1.png … framed-art-carousel-3.png */
const FRAMED_ART_CAROUSEL_IMAGES = [
  "/framed-art-carousel-1.png",
  "/framed-art-carousel-2.png",
  "/framed-art-carousel-3.png",
] as const;

const PRICING_CARDS = [
  {
    labelKey: "home.framedArt.priceCardSingle" as const,
    total: FRAMED_ART_UNIT_PRICE,
    perPhoto: FRAMED_ART_UNIT_PRICE,
    bestValue: false,
  },
  {
    labelKey: "home.framedArt.priceCardTwo" as const,
    total: FRAMED_ART_TWO_PRICE,
    perPhoto: Math.floor(FRAMED_ART_TWO_PRICE / 2),
    bestValue: false,
  },
  {
    labelKey: "home.framedArt.priceCardThree" as const,
    total: FRAMED_ART_THREE_PRICE,
    perPhoto: Math.floor(FRAMED_ART_THREE_PRICE / 3),
    bestValue: true,
  },
];

export function FramedArtHomeSection() {
  const { t, locale } = useLanguage();
  const reveal = useScrollReveal(easeOwlet);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const imageCount = FRAMED_ART_CAROUSEL_IMAGES.length;

  const goToSlide = (index: number) => {
    setCarouselIndex((index + imageCount) % imageCount);
  };

  const handleCarouselDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const { offset, velocity } = info;
    const swipeRight = offset.x > 40 || velocity.x > 300;
    const swipeLeft = offset.x < -40 || velocity.x < -300;
    if (!swipeRight && !swipeLeft) return;

    if (locale === "he") {
      if (swipeRight) goToSlide(carouselIndex + 1);
      else goToSlide(carouselIndex - 1);
    } else {
      if (swipeLeft) goToSlide(carouselIndex - 1);
      else goToSlide(carouselIndex + 1);
    }
  };

  return (
    <motion.section
      id="framed-art"
      aria-label={t("home.framedArt.ariaLabel")}
      className="relative bg-white pb-12 pt-8 lg:pb-16 lg:pt-4"
      {...reveal.section}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div
            className={`order-1 space-y-6 ${
              locale === "en" ? "text-center lg:text-left" : "text-center lg:text-right"
            }`}
          >
            <div
              className={`flex w-full flex-col gap-2 items-center lg:items-start`}
            >
              <span className="w-fit shrink-0 rounded-full border border-primary-orange/60 bg-primary-orange/10 px-3 py-1 text-sm font-body-bold text-primary-orange">
                {t("home.framedArt.badge")}
              </span>
              <Title
                highlightText={t("home.framedArt.titleHighlight")}
                className="text-3xl lg:text-4xl"
              >
                {t("home.framedArt.title")}
              </Title>
            </div>
            <p className="font-body text-medium-gray leading-relaxed">
              {t("home.framedArt.subtitle")}
            </p>

            <div className="mx-auto w-full space-y-2 lg:w-3/4">
              <div className="px-2 pb-2.5 pt-4">
                <div
                  className="grid grid-cols-3 gap-1.5 sm:gap-2"
                  dir={locale === "he" ? "rtl" : "ltr"}
                >
                  {PRICING_CARDS.map((card) => (
                    <div
                      key={card.labelKey}
                      className="relative flex flex-col items-center rounded-lg border border-[#E8DFD4] bg-white px-1.5 py-3 text-center sm:px-2"
                    >
                      {card.bestValue && (
                        <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary-orange px-2 py-0.5 text-[10px] font-body-bold leading-none text-white">
                          {t("home.framedArt.bestValue")}
                        </span>
                      )}
                      <p className="text-xs font-body-bold text-dark-gray sm:text-sm">
                        {t(card.labelKey)}
                      </p>
                      <p
                        className="mt-1 font-heading text-xl font-light leading-none text-dark-gray tabular-nums sm:text-2xl"
                        dir="ltr"
                      >
                        ₪{card.total}
                      </p>
                      <p className="mt-1 text-[10px] text-medium-gray sm:text-xs">
                        {t("home.framedArt.pricePerPhoto").replace(
                          "{price}",
                          String(card.perPhoto),
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="-mt-1 text-center text-xs text-medium-gray">
                {t("home.framedArt.discountNote")}
              </p>

              <div className="mt-10 flex justify-center">
                <Link href="/framed-art/upload" aria-label={t("home.framedArt.ctaAriaLabel")}>
                  <MuiButton
                    variant="contained"
                    color="primary"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontFamily: "var(--font-assistant)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      textTransform: "none",
                    }}
                  >
                    {t("home.framedArt.cta")}
                  </MuiButton>
                </Link>
              </div>
            </div>
          </div>

          <div className="order-2 flex flex-col items-center">
            <motion.div
              className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg touch-pan-y cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={handleCarouselDragEnd}
            >
              {FRAMED_ART_CAROUSEL_IMAGES.map((src, i) => (
                <motion.div
                  key={src}
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    opacity: i === carouselIndex ? 1 : 0,
                    pointerEvents: i === carouselIndex ? "auto" : "none",
                  }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  aria-hidden={i !== carouselIndex}
                >
                  <Image
                    src={src}
                    alt={t("home.framedArt.imageAlt")}
                    fill
                    className="object-cover pointer-events-none select-none"
                    sizes="(max-width: 768px) 90vw, 45vw"
                    priority={i === 0}
                    draggable={false}
                  />
                </motion.div>
              ))}
            </motion.div>

            <div
              className="mt-4 flex justify-center gap-2"
              role="tablist"
              aria-label={t("home.framedArt.ariaLabel")}
            >
              {FRAMED_ART_CAROUSEL_IMAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={carouselIndex === i}
                  onClick={() => setCarouselIndex(i)}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                    carouselIndex === i
                      ? "bg-primary-orange scale-110"
                      : "bg-gray-300 hover:bg-primary-orange/50"
                  }`}
                  aria-label={t("home.framedArt.carouselDotAria")
                    .replace("{num}", String(i + 1))
                    .replace("{total}", String(imageCount))}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
