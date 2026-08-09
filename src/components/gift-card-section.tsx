"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/CartContext";
import { HomeCtaButton } from "@/components/home-cta-button";
import { GIFT_CARD_OPTIONS } from "@/lib/constants";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const easeOwlet = [0.16, 1, 0.3, 1] as const;

export function GiftCardSection() {
  const { t, locale } = useLanguage();
  const reveal = useScrollReveal(easeOwlet);
  const { addGiftCardToCart } = useCart();
  
  const [selectedOption, setSelectedOption] = useState<string>(
    GIFT_CARD_OPTIONS[0].id // Pre-select ₪220
  );
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addGiftCardToCart(selectedOption);
      // Success feedback could be added here
    } catch (error) {
      console.error("Error adding gift card:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to add gift card'}`);
      // Error feedback could be added here
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.section
      id="gift-card"
      className="relative bg-[#FAF7F4] pb-16 lg:pb-24"
      {...reveal.section}
      transition={{ duration: 0.9, ease: easeOwlet }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto"
          {...reveal.staggerContainer({ amount: 0.2 })}
        >
          {/* Title */}
          <motion.div
            className="mb-8 text-center pt-8 lg:pt-10"
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: easeOwlet },
              },
            }}
          >
            <Title
              highlightText={t("giftCard.titleHighlight")}
              size="lg"
              className="text-center mb-8"
            >
              {t("giftCard.title")}
            </Title>

            {/* Gift Card Image Placeholder */}
            <motion.div
              className="w-full max-w-md mx-auto mb-8"
              {...reveal.imageReveal}
            >
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/gift-card.png"
                  alt={t("giftCard.title")}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 448px"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Description */}
          <motion.div
            className="mb-8"
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: easeOwlet },
              },
            }}
          >
            <p className="mx-auto max-w-2xl text-center font-body text-base leading-relaxed text-medium-gray">
              {t("giftCard.description")}
            </p>
          </motion.div>

          {/* Option Selection */}
          <motion.div
            className="mb-8"
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: easeOwlet },
              },
            }}
          >
            <div
              dir={locale === "he" ? "rtl" : "ltr"}
              className="mx-auto mb-2 grid max-w-md grid-cols-2 gap-3"
            >
              <span aria-hidden="true" />
              <span className="text-end text-sm font-body text-primary-orange">
                {t("giftCard.feature4")}
              </span>
            </div>

            <div
              dir={locale === "he" ? "rtl" : "ltr"}
              className="mx-auto grid max-w-md grid-cols-1 gap-3"
            >
              {GIFT_CARD_OPTIONS.map((option) => {
                const isSelected = selectedOption === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedOption(option.id)}
                    className={`cursor-pointer rounded-xl bg-white px-4 py-4 transition-all hover:opacity-90 ${
                      isSelected
                        ? "border-2 border-primary-orange"
                        : "border border-[#E8DFD4]"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="font-heading text-2xl font-bold text-dark-gray tabular-nums"
                        dir="ltr"
                      >
                        ₪{option.price}
                      </span>
                      <span className="text-center font-body text-xs leading-tight text-medium-gray">
                        {t(option.labelKey)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Add to Cart Button */}
          <motion.div
            className="text-center"
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: easeOwlet },
              },
            }}
          >
            <HomeCtaButton
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-label={t("giftCard.ariaLabel")}
            >
              {isAdding ? t("giftCard.adding") : t("giftCard.addToCart")}
            </HomeCtaButton>

            <p className="mt-4 text-center text-sm font-body text-medium-gray">
              <span dir="ltr" className="inline-flex items-center gap-1.5">
                {locale === "he" ? (
                  <>
                    <span dir="rtl">{t("giftCard.emailNote")}</span>
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 6 10-6" />
                    </svg>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 6 10-6" />
                    </svg>
                    <span>{t("giftCard.emailNote")}</span>
                  </>
                )}
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
