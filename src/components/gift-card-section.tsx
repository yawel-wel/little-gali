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
  
  const selectedOption = GIFT_CARD_OPTIONS[0].id;
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
            <div className="mx-auto grid max-w-md grid-cols-1 gap-3">
              {GIFT_CARD_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className="rounded-[20px] border border-[#D4C0A8] bg-[#FBF8F4] px-4 py-3 sm:px-5 sm:py-3.5"
                >
                  <div className="flex items-center gap-3.5" dir="ltr">
                    <GiftCardSparkles
                      className={`h-10 w-10 shrink-0 sm:h-11 sm:w-11 ${PRICE_CARD_ACCENT_CLASS}`}
                    />
                    <div className="h-11 w-px shrink-0 bg-[#D4C0A8] sm:h-12" />
                    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1">
                      <span
                        className="font-heading text-4xl font-bold leading-none text-accent-burgundy tabular-nums sm:text-[2.5rem]"
                        dir="ltr"
                      >
                        ₪{option.price}
                      </span>
                      <span
                        className="text-center font-body text-sm leading-tight text-accent-burgundy sm:text-base"
                        dir={locale === "he" ? "rtl" : "ltr"}
                      >
                        {t(option.labelKey)}
                      </span>
                    </div>
                    <GiftCardIcon
                      className={`h-10 w-10 shrink-0 sm:h-11 sm:w-11 ${PRICE_CARD_ACCENT_CLASS}`}
                    />
                  </div>
                </div>
              ))}
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
