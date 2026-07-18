"use client";

import { motion } from "framer-motion";
import { Title } from "@/components/title";
import { HomeCtaButton } from "@/components/home-cta-button";
import { QaTabsSection, HOME_BOOK_IDS } from "@/components/qa-tabs-section";
import { useLanguage } from "@/lib/LanguageContext";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const easeOwlet = [0.16, 1, 0.3, 1] as const;

type QaPreviewSectionProps = {
  showCta?: boolean;
  subtitleKey?: string;
};

export function QaPreviewSection({
  showCta = true,
  subtitleKey = "home.qa.subtitle",
}: QaPreviewSectionProps) {
  const { t } = useLanguage();
  const reveal = useScrollReveal(easeOwlet);

  return (
    <motion.section
      id="qa"
      aria-labelledby="qa-heading"
      className="relative pb-16 lg:pb-24 bg-[#F3EEE8]"
      {...reveal.section}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 pt-8 lg:pt-10">
          <Title
            as="h2"
            id="qa-heading"
            highlightText={t("home.qa.titleHighlight")}
            size="lg"
            className="mb-4 text-[28px] sm:text-3xl"
          >
            {t("home.qa.title")}
          </Title>
          <p className="mx-auto max-w-2xl font-body text-base leading-relaxed text-medium-gray">
            {t(subtitleKey)}
          </p>
        </div>

        <QaTabsSection
          className="max-w-4xl mx-auto"
          bookItemIds={[...HOME_BOOK_IDS]}
          hideTabs
        />

        {showCta && (
          <div className="text-center mt-12">
            <a href="/qa" aria-label={t("home.qa.ctaAriaLabel")}>
              <HomeCtaButton>{t("home.qa.cta")}</HomeCtaButton>
            </a>
          </div>
        )}
      </div>
    </motion.section>
  );
}
