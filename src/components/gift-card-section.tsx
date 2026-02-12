"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/CartContext";
import MuiButton from "@mui/material/Button";
import { GIFT_CARD_OPTIONS } from "@/lib/constants";

interface GiftCardSectionProps {
  prefersReducedMotion: boolean | null;
  easeOwlet: any;
}

export function GiftCardSection({
  prefersReducedMotion,
  easeOwlet,
}: GiftCardSectionProps) {
  const { t, locale } = useLanguage();
  const { addGiftCardToCart } = useCart();
  
  const [selectedOption, setSelectedOption] = useState<string>(
    GIFT_CARD_OPTIONS[1].id // Pre-select second option (₪175)
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
      className="relative py-16 lg:py-24 bg-white"
      initial={
        prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }
      }
      whileInView={
        prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
      }
      transition={{ duration: 0.9, ease: easeOwlet }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView={prefersReducedMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.15 },
            },
          }}
        >
          {/* Title */}
          <motion.div
            className="mb-8 text-center"
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
              initial={prefersReducedMotion ? undefined : { scale: 0.95, opacity: 0 }}
              whileInView={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: easeOwlet, delay: 0.2 }}
              viewport={{ once: true, amount: 0.3 }}
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
            <p className="text-base font-body text-medium-gray text-center max-w-2xl mx-auto whitespace-pre-line">
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
            <div className="text-center mb-4">
              <p className="text-sm font-body text-primary-orange mb-0.5">
                {t("giftCard.feature4")}
              </p>
              <h3 className="text-xl font-heading font-bold text-dark-gray">
                {t("giftCard.selectOption")}
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {GIFT_CARD_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`px-4 py-3 rounded-lg transition-all cursor-pointer hover:opacity-80 ${
                    selectedOption === option.id
                      ? "bg-primary-orange text-white shadow-lg"
                      : "bg-white text-dark-gray border-2 border-gray-300 hover:border-primary-orange"
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xl md:text-2xl font-heading font-bold">
                      ₪{option.price}
                    </span>
                    <span className={`text-xs font-body leading-tight ${
                      selectedOption === option.id
                        ? "text-white/90"
                        : "text-medium-gray"
                    }`}>
                      {t(option.labelKey)}
                    </span>
                  </div>
                </button>
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
            <MuiButton
              onClick={handleAddToCart}
              disabled={isAdding}
              variant="contained"
              color="primary"
              aria-label={t("giftCard.ariaLabel")}
              sx={{
                px: 6,
                py: 1.5,
                fontFamily: "var(--font-assistant)",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
              }}
            >
              {isAdding ? t("giftCard.adding") : t("giftCard.addToCart")}
            </MuiButton>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
