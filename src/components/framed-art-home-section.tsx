"use client";

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

          <div className="order-2 flex justify-center">
            <div className="relative aspect-square w-full max-w-md overflow-hidden">
              <Image
                src="/framed-art-hero.png"
                alt={t("home.framedArt.imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 90vw, 45vw"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
