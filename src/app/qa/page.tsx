"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { isFramedArtEnabled } from "@/lib/feature-flags";
import { QaTabsSection } from "@/components/qa-tabs-section";

const easeOwlet = [0.16, 1, 0.3, 1];

export default function QAPage() {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useLanguage();
  const framedOn = isFramedArtEnabled();
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#F3EEE8" }}>
      <Header />

      <main id="main-content" className="flex-1" style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}>
        {/* Q&A Section */}
        <motion.section
          className="relative pb-16 lg:pb-24 pt-8 lg:pt-10"
          style={{ backgroundColor: "#F3EEE8" }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-6">
              <Title highlightText={t("home.qa.titleHighlight")} size="lg" className="mb-4">
                {t("home.qa.title")}
              </Title>
              <p className="mx-auto max-w-2xl font-body text-base leading-relaxed text-medium-gray">
                {t("home.qa.subtitle")}
              </p>
            </div>

            <QaTabsSection className="max-w-4xl mx-auto" hideTabs={!framedOn} />

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={
                  prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                }
                transition={{ duration: 1.1, ease: easeOwlet }}
                viewport={{ once: true, amount: 0.25 }}
              >
                <a href="/contact" className="block">
                  <p className="font-body text-medium-gray mb-6 cursor-pointer hover:text-dark-gray transition-colors">
                    {t("qa.notFound")}
                  </p>
                  <motion.div
                    whileHover={{
                      scale: 1.01,
                      y: -1,
                      transition: { duration: 0.2, ease: easeOwlet },
                    }}
                  >
                    <Button className="cursor-pointer bg-soft-peach hover:bg-soft-peach/90 text-white px-8 py-3 rounded-full font-body-bold text-sm transition-all duration-200">
                      {t("qa.contact")}
                    </Button>
                  </motion.div>
                </a>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
