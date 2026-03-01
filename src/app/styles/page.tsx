"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";
import MuiButton from "@mui/material/Button";
import { ChevronDown, ChevronUp } from "lucide-react";

const easeOwlet = [0.16, 1, 0.3, 1];

type StyleType = "cartoon" | "pencil" | "watercolor";

interface StyleExample {
  input: string;
  output: string;
  inputAlt: string;
  outputAlt: string;
}

// Extended examples for the dedicated page - using actual images from /public
const styleExamples: Record<StyleType, StyleExample[]> = {
  cartoon: [
    {
      input: "/close-family-1.png",
      output: "/close-family-color-1.png",
      inputAlt: "Original family photo",
      outputAlt: "Cartoon style result",
    },
    {
      input: "/close-family-2.png",
      output: "/close-family-color-2.png",
      inputAlt: "Original family photo",
      outputAlt: "Cartoon style result",
    },
    {
      input: "/close-family-3.png",
      output: "/close-family-color-3.png",
      inputAlt: "Original family photo",
      outputAlt: "Cartoon style result",
    },
    {
      input: "/close-family-4.png",
      output: "/close-family-color-4.png",
      inputAlt: "Original family photo",
      outputAlt: "Cartoon style result",
    },
  ],
  pencil: [
    {
      input: "/extended-family-1.png",
      output: "/extended-family-color-1.png",
      inputAlt: "Original family photo",
      outputAlt: "Pencil style result",
    },
    {
      input: "/extended-family-2.png",
      output: "/extended-family-color-2.png",
      inputAlt: "Original family photo",
      outputAlt: "Pencil style result",
    },
    {
      input: "/extended-family-3.png",
      output: "/extended-family-color-3.png",
      inputAlt: "Original family photo",
      outputAlt: "Pencil style result",
    },
    {
      input: "/extended-family-4.jpg",
      output: "/extended-family-color-4.jpg",
      inputAlt: "Original family photo",
      outputAlt: "Pencil style result",
    },
  ],
  watercolor: [
    {
      input: "/baby-1.png",
      output: "/baby-color-1.png",
      inputAlt: "Original baby photo",
      outputAlt: "Watercolor style result",
    },
    {
      input: "/baby-2.png",
      output: "/baby-color-2.png",
      inputAlt: "Original baby photo",
      outputAlt: "Watercolor style result",
    },
    {
      input: "/baby-3.png",
      output: "/baby-color-3.png",
      inputAlt: "Original baby photo",
      outputAlt: "Watercolor style result",
    },
    {
      input: "/baby-4.png",
      output: "/baby-color-4.png",
      inputAlt: "Original baby photo",
      outputAlt: "Watercolor style result",
    },
  ],
};

// B&W examples - showing how original photos become B&W
const bwExamples: StyleExample[] = [
  {
    input: "/close-family-color-1.png",
    output: "/close-family-1.png",
    inputAlt: "Original color photo",
    outputAlt: "Black and white result",
  },
  {
    input: "/baby-color-1.png",
    output: "/baby-1.png",
    inputAlt: "Original color photo",
    outputAlt: "Black and white result",
  },
];

interface StyleSectionProps {
  styleKey: StyleType;
  title: string;
  subtitle: string;
  description: string;
  examples: StyleExample[];
  isExpanded: boolean;
  onToggle: () => void;
  t: (key: string) => string;
  prefersReducedMotion: boolean | null;
}

function StyleSection({
  styleKey,
  title,
  subtitle,
  description,
  examples,
  isExpanded,
  onToggle,
  t,
  prefersReducedMotion,
}: StyleSectionProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeOwlet }}
      viewport={{ once: true, amount: 0.15 }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-6 lg:p-8 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-2xl lg:text-3xl font-heading font-bold text-dark-gray mb-2">
              {title}
            </h3>
            <p className="text-base lg:text-lg font-body-bold text-primary-orange mb-2">
              {subtitle}
            </p>
            <p className="text-sm lg:text-base font-body text-medium-gray leading-relaxed">
              {description}
            </p>
          </div>
          <div className="ml-4">
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-dark-gray" />
            ) : (
              <ChevronDown className="w-6 h-6 text-dark-gray" />
            )}
          </div>
        </div>
      </button>

      {/* Examples Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: easeOwlet }}
            className="overflow-hidden"
          >
            <div className="p-6 lg:p-8 pt-0 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {examples.map((example, index) => (
                <motion.div
                  key={`${styleKey}-${index}`}
                  className="space-y-2"
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }
                  }
                  animate={
                    prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }
                  }
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    ease: easeOwlet,
                  }}
                >
                  {/* Before */}
                  <div>
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-1">
                      <Image
                        src={example.input}
                        alt={example.inputAlt}
                        fill
                        loading="lazy"
                        className="object-cover"
                        sizes="(max-width: 768px) 40vw, 20vw"
                      />
                    </div>
                    <p className="text-xs font-body text-medium-gray text-center">
                      {t("styles.before")}
                    </p>
                  </div>

                  {/* After */}
                  <div>
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-1">
                      <Image
                        src={example.output}
                        alt={example.outputAlt}
                        fill
                        loading="lazy"
                        className="object-cover"
                        sizes="(max-width: 768px) 40vw, 20vw"
                      />
                    </div>
                    <p className="text-xs font-body text-medium-gray text-center">
                      {t("styles.after")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function StylesPage() {
  const { t, locale } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    bw: false,
    cartoon: true, // Start with cartoon expanded
    pencil: false,
    watercolor: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-warm-cream">
      <Header />

      <main
        className="flex-1"
        style={{ paddingTop: "calc(96px + var(--banner-height, 0px))" }}
      >
        {/* Hero Section */}
        <motion.section
          className="relative py-8 lg:py-12 bg-[#F9F7EE]"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: easeOwlet }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <Title
                highlightText={t("styles.titleHighlight")}
                size="xl"
                className="mb-4"
              >
                {t("styles.title")}
              </Title>
              <p
                className={`text-base lg:text-lg font-body text-medium-gray max-w-3xl mx-auto ${
                  locale === "en" ? "text-center" : "text-center"
                }`}
              >
                {t("styles.subtitle")}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Main Content */}
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Intro Text */}
            <motion.p
              className={`text-base lg:text-lg font-body text-dark-gray mb-8 lg:mb-12 max-w-3xl mx-auto ${
                locale === "en" ? "text-left" : "text-right"
              }`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.6, ease: easeOwlet }}
              viewport={{ once: true }}
            >
              {t("styles.hero.description")}
            </motion.p>

            {/* B&W Section */}
            <StyleSection
              styleKey="cartoon" // Using cartoon as key but it's B&W
              title={t("styles.bw.title")}
              subtitle=""
              description={t("styles.bw.description")}
              examples={bwExamples}
              isExpanded={expandedSections.bw}
              onToggle={() => toggleSection("bw")}
              t={t}
              prefersReducedMotion={prefersReducedMotion}
            />

            {/* Colorful Styles Intro */}
            <motion.div
              className="mb-8 mt-12"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.6, ease: easeOwlet }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl lg:text-3xl font-heading font-bold text-dark-gray mb-3 text-center">
                {t("styles.colorful.title")}
              </h2>
              <p
                className={`text-base lg:text-lg font-body text-medium-gray text-center max-w-2xl mx-auto ${
                  locale === "en" ? "text-center" : "text-center"
                }`}
              >
                {t("styles.colorful.description")}
              </p>
            </motion.div>

            {/* Cartoon Style */}
            <StyleSection
              styleKey="cartoon"
              title={t("styles.cartoon.title")}
              subtitle={t("styles.cartoon.subtitle")}
              description={t("styles.cartoon.description")}
              examples={styleExamples.cartoon}
              isExpanded={expandedSections.cartoon}
              onToggle={() => toggleSection("cartoon")}
              t={t}
              prefersReducedMotion={prefersReducedMotion}
            />

            {/* Pencil Style */}
            <StyleSection
              styleKey="pencil"
              title={t("styles.pencil.title")}
              subtitle={t("styles.pencil.subtitle")}
              description={t("styles.pencil.description")}
              examples={styleExamples.pencil}
              isExpanded={expandedSections.pencil}
              onToggle={() => toggleSection("pencil")}
              t={t}
              prefersReducedMotion={prefersReducedMotion}
            />

            {/* Watercolor Style */}
            <StyleSection
              styleKey="watercolor"
              title={t("styles.watercolor.title")}
              subtitle={t("styles.watercolor.subtitle")}
              description={t("styles.watercolor.description")}
              examples={styleExamples.watercolor}
              isExpanded={expandedSections.watercolor}
              onToggle={() => toggleSection("watercolor")}
              t={t}
              prefersReducedMotion={prefersReducedMotion}
            />

            {/* CTA Section */}
            <motion.div
              className="text-center mt-12 lg:mt-16"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.6, ease: easeOwlet }}
              viewport={{ once: true }}
            >
              <a href="/upload" aria-label={t("styles.ctaAriaLabel")}>
                <MuiButton
                  variant="contained"
                  color="primary"
                  sx={{
                    px: 6,
                    py: 2,
                    fontFamily: "var(--font-assistant)",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    textTransform: "none",
                  }}
                >
                  {t("styles.cta")}
                </MuiButton>
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
