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
const PRICE_CARD_ACCENT_CLASS = "text-[#D4C0A8]";

function FourPointStar({
  cx,
  cy,
  outer,
  inner,
}: {
  cx: number;
  cy: number;
  outer: number;
  inner: number;
}) {
  return (
    <path
      d={`M${cx} ${cy - outer} L${cx + inner} ${cy - inner} L${cx + outer} ${cy} L${cx + inner} ${cy + inner} L${cx} ${cy + outer} L${cx - inner} ${cy + inner} L${cx - outer} ${cy} L${cx - inner} ${cy - inner} Z`}
    />
  );
}

function GiftCardSparkles({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 52 52"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <FourPointStar cx={18} cy={27} outer={16} inner={4} />
      <FourPointStar cx={40} cy={12} outer={8.5} inner={2.1} />
      <FourPointStar cx={42} cy={38} outer={6.5} inner={1.6} />
    </svg>
  );
}

function GiftCardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="20" width="32" height="20" rx="2.5" />
      <path d="M8 28h32" />
      <path d="M24 20v20" />
      <path d="M24 20c0-5 4.5-8 8-5.2 2.4 1.9.6 5.2-8 7.2" />
      <path d="M24 20c0-5-4.5-8-8-5.2-2.4 1.9-.6 5.2 8 7.2" />
    </svg>
  );
}

export function GiftCardSection() {
  const { t, locale } = useLanguage();
  const reveal = useScrollReveal(easeOwlet);
  const { addGiftCardToCart } = useCart();
  
  const [selectedOption, setSelectedOption] = useState<string>(
    GIFT_CARD_OPTIONS[0].id,
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

          {/* Price card */}
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
              className="mx-auto grid max-w-lg grid-cols-2 gap-3 sm:gap-4"
              role="radiogroup"
              aria-label={t("giftCard.selectOption")}
            >
              {GIFT_CARD_OPTIONS.map((option) => {
                const isSelected = option.id === selectedOption;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedOption(option.id)}
                    className={`relative flex h-full w-full cursor-pointer flex-col items-center rounded-[20px] border-2 px-3 pb-5 pt-6 text-center transition-all duration-200 sm:px-5 sm:pb-6 sm:pt-7 ${
                      isSelected
                        ? "border-accent-burgundy bg-white shadow-md"
                        : "border-[#D4C0A8]/60 bg-[#FBF8F4] hover:-translate-y-0.5 hover:border-[#D4C0A8] hover:shadow-sm"
                    }`}
                  >
                    {/* Selection indicator */}
                    <span
                      className={`absolute top-3 start-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                        isSelected
                          ? "border-accent-burgundy bg-accent-burgundy"
                          : "border-[#D4C0A8] bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <svg
                          viewBox="0 0 16 16"
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3.5 8.5l3 3 6-7" />
                        </svg>
                      )}
                    </span>

                    <GiftCardSparkles
                      className={`absolute top-3 end-3 h-6 w-6 ${PRICE_CARD_ACCENT_CLASS}`}
                    />

                    <GiftCardIcon
                      className={`mb-3 h-10 w-10 sm:h-12 sm:w-12 ${PRICE_CARD_ACCENT_CLASS}`}
                    />

                    <span
                      className="font-heading text-3xl font-bold leading-none text-accent-burgundy tabular-nums sm:text-[2.5rem]"
                      dir="ltr"
                    >
                      ₪{option.price}
                    </span>

                    <span className="my-3 h-px w-10 bg-[#D4C0A8]" aria-hidden="true" />

                    {/* Label fills the remaining height so the notes line up across cards */}
                    <span
                      className="flex flex-1 items-center justify-center font-body-bold text-sm leading-snug text-accent-burgundy sm:text-base"
                      dir={locale === "he" ? "rtl" : "ltr"}
                    >
                      {t(option.labelKey)}
                    </span>

                    {option.noteKey && (
                      <span
                        className="mt-2 font-body text-xs text-medium-gray sm:text-sm"
                        dir={locale === "he" ? "rtl" : "ltr"}
                      >
                        {t(option.noteKey)}
                      </span>
                    )}
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
