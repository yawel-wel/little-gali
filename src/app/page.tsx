"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  animate,
} from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { TestimonialsSection } from "@/components/testimonials-section";
import { GiftCardSection } from "@/components/gift-card-section";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { BOOK_PRICE } from "@/lib/constants";
import { isAiPreviewEnabled, isFramedArtEnabled } from "@/lib/feature-flags";
import { BookFeaturePills, FreePreviewNote } from "@/components/feature-pill";
import { FramedArtHomeSection } from "@/components/framed-art-home-section";
import { QaTabsSection, HOME_BOOK_IDS, HOME_FRAMED_IDS } from "@/components/qa-tabs-section";
import { useLanguage } from "@/lib/LanguageContext";
import { HomeCtaButton } from "@/components/home-cta-button";

const HERO_IMAGE_MOBILE = "/hero-image-mobile.png";
const HERO_IMAGE_DESKTOP = "/hero-image-desktop.JPG";

const dotVariants = {
  inactive: {
    width: "0.5rem",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  active: {
    width: ["0.4rem", "0.2rem", "1.5rem", "1.25rem"],
    transition: { duration: 0.45, ease: "easeOut", times: [0, 0.1, 0.65, 1] },
  },
};


export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const easeOwlet: any = [0.16, 1, 0.3, 1];
  const { t, locale } = useLanguage();
  const previewOn = isAiPreviewEnabled();
  const framedOn = isFramedArtEnabled();
  const howItWorksSteps = previewOn
    ? [
        {
          num: 1,
          labelKey: "home.howItWorks.step1.label",
          titleKey: "home.howItWorks.step1.title",
          descriptionKey: "home.howItWorks.step1.description",
          imageAltKey: "home.howItWorks.step1.imageAlt",
          src: "/how-it-works-step-1.jpg",
        },
        {
          num: 2,
          labelKey: "home.howItWorks.previewStep2.label",
          titleKey: "home.howItWorks.previewStep2.title",
          descriptionKey: "home.howItWorks.previewStep2.description",
          imageAltKey: "home.howItWorks.previewStep2.imageAlt",
          src: "/how-it-works-step-2.jpg",
        },
        {
          num: 3,
          labelKey: "home.howItWorks.previewStep3.label",
          titleKey: "home.howItWorks.previewStep3.title",
          descriptionKey: "home.howItWorks.previewStep3.description",
          imageAltKey: "home.howItWorks.previewStep3.imageAlt",
          src: "/how-it-works-step-3.jpg",
        },
      ]
    : [
        {
          num: 1,
          labelKey: "home.howItWorks.step1.label",
          titleKey: "home.howItWorks.step1.title",
          descriptionKey: "home.howItWorks.step1.descriptionWithoutPreview",
          imageAltKey: "home.howItWorks.step1.imageAlt",
          src: "/how-it-works-step-1.png",
        },
        {
          num: 2,
          labelKey: "home.howItWorks.step2.label",
          titleKey: "home.howItWorks.step2.title",
          descriptionKey: "home.howItWorks.step2.description",
          imageAltKey: "home.howItWorks.step2.imageAlt",
          src: "/how-it-works-step-2.png",
        },
      ];
  const specialSteps = [
    {
      titleKey: "home.special.item1.title",
      descriptionKey: "home.special.item1.description",
      imageAltKey: "home.special.item1.imageAlt",
      src: "/why-us-1.png",
    },
    {
      titleKey: "home.special.item2.title",
      descriptionKey: "home.special.item2.description",
      imageAltKey: "home.special.item2.imageAlt",
      src: "/why-us-2.png",
    },
    {
      titleKey: "home.special.item3.title",
      descriptionKey: "home.special.item3.description",
      imageAltKey: "home.special.item3.imageAlt",
      src: "/why-us-3.png",
    },
    {
      titleKey: "home.special.item4.title",
      descriptionKey: "home.special.item4.description",
      imageAltKey: "home.special.item4.imageAlt",
      src: "/why-us-4.png",
    },
  ];
  const reveal = useScrollReveal(easeOwlet);
  const bookImages = [
    { src: "/our-book-light.JPG", labelKey: "home.book.bwSide" as const },
    { src: "/our-book-dark.JPG", labelKey: "home.book.colorSide" as const },
  ];
  const [bookImageIndex, setBookImageIndex] = useState(0);
  const bookCarouselRef = useRef<HTMLDivElement>(null);
  const bookX = useMotionValue(0);
  const [bookStep, setBookStep] = useState(0);

  // Compute and keep the carousel step (80% of container width) up to date
  useEffect(() => {
    const update = () => {
      if (bookCarouselRef.current) {
        setBookStep(bookCarouselRef.current.offsetWidth * 0.8);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Animate bookX whenever the index changes (from labels, dots, or drag)
  useEffect(() => {
    if (bookStep === 0) return;
    const targetX = locale === "he" ? bookImageIndex * bookStep : -bookImageIndex * bookStep;
    animate(bookX, targetX, { type: "spring", stiffness: 260, damping: 28, mass: 0.9 });
  }, [bookImageIndex, locale, bookStep]);

  const handleBookDragEnd = (_: any, info: any) => {
    const step = (bookCarouselRef.current?.offsetWidth ?? bookStep / 0.8) * 0.8;
    const threshold = step * 0.25;
    const { offset, velocity } = info;
    let newIndex = bookImageIndex;
    if (locale === "he") {
      // RTL: drag right (positive) reveals color at +step
      if (offset.x > threshold || velocity.x > 300) {
        newIndex = Math.min(bookImageIndex + 1, bookImages.length - 1);
      } else if (offset.x < -threshold || velocity.x < -300) {
        newIndex = Math.max(bookImageIndex - 1, 0);
      }
    } else {
      // LTR: drag left (negative) reveals color at -step
      if (offset.x < -threshold || velocity.x < -300) {
        newIndex = Math.min(bookImageIndex + 1, bookImages.length - 1);
      } else if (offset.x > threshold || velocity.x > 300) {
        newIndex = Math.max(bookImageIndex - 1, 0);
      }
    }
    setBookImageIndex(newIndex);
    const targetX = locale === "he" ? newIndex * step : -newIndex * step;
    animate(bookX, targetX, { type: "spring", stiffness: 260, damping: 28, mass: 0.9 });
  };

  // Handle hash scrolling on page load and when hash changes
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const timeoutId = window.setTimeout(scrollToHash, 100);
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  // Explicitly reset scroll after mount
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  }, []);

  return (
    <div className="overflow-x-hidden bg-warm-light">
      <Header />

      <main id="main-content" className="flex-1" style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}>
        {/* Hero Section */}
        <section id="hero" aria-label={t("home.hero.ariaLabel")} className="relative w-full min-h-[500px] md:min-h-[600px] lg:min-h-[650px] overflow-hidden pt-[120px]">
          <div className="absolute inset-0">
            <Image
              src={HERO_IMAGE_MOBILE}
              alt={t("home.hero.imageAlt")}
              fill
              priority
              className="object-cover md:hidden"
              sizes="100vw"
            />
            <Image
              src={HERO_IMAGE_DESKTOP}
              alt={t("home.hero.imageAlt")}
              fill
              priority
              className="hidden object-cover md:block"
              sizes="100vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-black/8 via-black/5 to-black/0"
              aria-hidden="true"
            />
          </div>
          {/* Content Overlay */}
          <div className="absolute inset-0 z-10 flex items-start pt-6 md:pt-[130px]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-xl text-start mt-2 md:mt-0">
                <span className="mb-[8px] inline-flex w-fit items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-sm font-body text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)] max-md:px-[15px] max-md:py-[5px] max-md:text-[12px]">
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2l2.09 6.26L20.5 9.5l-5 3.64L17.18 20 12 16.77 6.82 20l1.68-6.86-5-3.64 6.41-1.24L12 2z" />
                  </svg>
                  {t("home.hero.badge")}
                </span>

                {(() => {
                  const titleText = t("home.hero.title");
                  const highlightText = t("home.hero.titleHighlight");
                  const titleParts = titleText.split("|");
                  const titleClassName =
                    "m-0 max-md:text-[28px] text-4xl sm:text-4xl md:text-[40px] lg:text-[64px] font-heading font-bold !leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] text-white md:-mt-1 lg:-mt-2";

                  const renderHighlight = (text: string) => {
                    const highlightIndex = text.indexOf(highlightText);
                    if (highlightIndex === -1) return text;

                    const beforeHighlight = text.substring(0, highlightIndex);
                    const afterHighlight = text.substring(
                      highlightIndex + highlightText.length
                    );

                    return (
                      <>
                        <span className="whitespace-nowrap">
                          {beforeHighlight}
                          <span className="relative inline-block">
                            <span className="relative z-10">{highlightText}</span>
                            <motion.svg
                              className="absolute bottom-0 left-0"
                              aria-hidden="true"
                              style={{
                                width: "110%",
                                left: "-5%",
                                height: "14px",
                                transform: "rotate(-2deg)",
                                transformOrigin: "right center",
                                overflow: "visible",
                              }}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{
                                delay: 0.75,
                                duration: 0.8,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              preserveAspectRatio="none"
                              viewBox="0 0 100 14"
                            >
                              <path
                                d="M 0 14 Q 50 10, 100 14"
                                stroke="#e1a27d"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                style={{
                                  filter:
                                    "drop-shadow(0 2px 4px rgba(225, 162, 125, 0.3))",
                                }}
                              />
                            </motion.svg>
                          </span>
                          {afterHighlight}
                        </span>
                      </>
                    );
                  };

                  if (titleParts.length === 2) {
                    const [line1, line2] = titleParts;
                    return (
                      <h1 className={titleClassName}>
                        {line1}
                        <br />
                        {renderHighlight(line2)}
                      </h1>
                    );
                  }

                  return (
                    <Title
                      as="h1"
                      highlightText={highlightText}
                      color="text-white"
                      size="2xl"
                      className="m-0 !leading-none font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] max-md:text-[28px] md:text-[40px] lg:text-[64px] md:-mt-1 lg:-mt-2"
                      animateUnderline={true}
                    >
                      {titleText}
                    </Title>
                  );
                })()}

                <p className="mt-2.5 font-body text-base sm:text-lg text-white/90 leading-relaxed max-w-md drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] md:hidden">
                  {t("home.hero.subtitle")}
                </p>

                <div className="mt-3 pt-2 max-md:pt-0 md:mt-5">
                  <a href="/upload" aria-label={t("home.hero.ctaAriaLabel")}>
                    <HomeCtaButton
                      sx={{
                        px: { xs: "30px", md: "36px" },
                        py: { xs: "8px", md: "12px" },
                        fontSize: { xs: "12px", md: "14px" },
                      }}
                    >
                      {t("home.hero.cta")}
                    </HomeCtaButton>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* הספרון שלנו Section */}
        <motion.section
          id="book"
          aria-label={t("home.book.ariaLabel")}
          className="relative -mt-0 pt-8 lg:pt-0 pb-12 lg:pb-16 bg-white"
          {...reveal.section}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Column - Text Content */}
                <div className="order-1 lg:order-1 space-y-6">
                  {/* Section header */}
                  <div
                    className={`-mt-3 ${
                      locale === "en"
                        ? "text-center lg:text-left"
                        : "text-center lg:text-right"
                    }`}
                  >
                    <p className="text-base lg:text-lg font-heading text-primary-orange">
                      {t("home.book.title")}
                    </p>
                    <h2 className="mt-0.5 lg:mt-0 text-[22px] sm:text-3xl lg:text-4xl font-heading font-bold text-dark-gray leading-tight">
                      {t("home.book.subtitle")
                        .split("|")
                        .map((line, i, lines) => (
                          <span key={i}>
                            {line}
                            {i < lines.length - 1 && <br />}
                          </span>
                        ))}
                    </h2>
                  </div>

                  {/* Description Text */}
                  <div
                    className={`-mt-3 space-y-3 ${
                      locale === "en"
                        ? "text-center lg:text-left"
                        : "text-center lg:text-right"
                    }`}
                  >
                    <p className="font-body text-medium-gray leading-relaxed">
                      {t("home.book.description")}
                    </p>
                    <BookFeaturePills t={t} locale={locale} />
                  </div>

                  {/* Price & CTA */}
                  <div
                    className={
                      locale === "en"
                        ? "text-center lg:text-left"
                        : "text-center lg:text-right"
                    }
                  >
                    <div
                      className={`inline-flex w-full max-w-md flex-col gap-4 lg:w-auto lg:min-w-[17rem] items-center ${
                        locale === "en"
                          ? "lg:mr-auto lg:items-start"
                          : "lg:ml-auto lg:items-end"
                      }`}
                    >
                    <div
                      className={`w-full ${
                        locale === "en"
                          ? "text-center lg:text-left"
                          : "text-center lg:text-right"
                      }`}
                    >
                      <span className="text-sm font-body text-medium-gray block mb-1">
                        {t("home.book.price")}
                      </span>
                      <div
                        className={`inline-flex items-baseline justify-center gap-0 font-heading font-bold text-dark-gray lg:justify-start ${
                          locale === "he" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="text-2xl">₪</span>
                        <span className="text-[32px] leading-none">{BOOK_PRICE}</span>
                      </div>
                    </div>

                    <p
                      className={`-mt-3 w-full font-body text-medium-gray text-sm sm:text-base ${
                        locale === "en"
                          ? "text-center lg:text-left"
                          : "text-center lg:text-right"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4 shrink-0 text-[#693430]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M7.5 12.5l3 3 5.5-6" />
                        </svg>
                        <span>{t("home.book.secondBook")}</span>
                      </span>
                    </p>

                    <a
                      href="/upload"
                      aria-label={t("home.book.ctaAriaLabel")}
                      className="block w-full"
                    >
                      <HomeCtaButton fullWidth>
                        {t("home.book.cta")}
                      </HomeCtaButton>
                    </a>

                    <FreePreviewNote
                      label={t("home.book.freePreview")}
                      locale={locale}
                      className={`-mt-2 w-full ${
                        locale === "en"
                          ? "text-center lg:text-left"
                          : "text-center lg:text-right"
                      }`}
                    />
                    </div>
                  </div>
                </div>

                {/* Right Column - Two Images with Toggle */}
                <div className="order-2 lg:order-2">
                  <div className="w-full">
                    {/* Label Tabs */}
                    <div className="flex gap-2 mb-3 justify-center lg:pt-[52px]">
                      {bookImages.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setBookImageIndex(i)}
                          aria-pressed={bookImageIndex === i}
                          className="text-sm font-body-bold px-4 py-1.5 rounded-full transition-colors bg-gray-100 text-gray-900 lg:cursor-pointer lg:hover:opacity-70"
                          style={{
                            border: bookImageIndex === i ? "2px solid #693430" : "2px solid transparent",
                          }}
                        >
                          {t(img.labelKey)}
                        </button>
                      ))}
                    </div>
                    {/* Image carousel — active image fills ~88%, other peeks from the side */}
                    <div
                      ref={bookCarouselRef}
                      className="overflow-hidden rounded-lg aspect-square select-none"
                    >
                      <motion.div
                        className="flex h-full"
                        style={{ width: "180%", gap: "2.22%", x: bookX }}
                        drag="x"
                        dragConstraints={{
                          left: locale === "he" ? 0 : -bookStep,
                          right: locale === "he" ? bookStep : 0,
                        }}
                        dragElastic={0.08}
                        onDragEnd={handleBookDragEnd}
                      >
                        {bookImages.map((img, i) => (
                          <div
                            key={i}
                            className="relative h-full flex-shrink-0 cursor-pointer"
                            style={{ width: "48.89%" }}
                            onClick={() => setBookImageIndex(i)}
                          >
                            <Image
                              src={img.src}
                              alt={t(img.labelKey)}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 80vw, 45vw"
                            />
                          </div>
                        ))}
                      </motion.div>
                    </div>

                    {/* Dot indicators — explicit left/right placement independent of RTL flex */}
                    <div className="flex justify-center gap-2 mt-3" style={{ direction: "ltr" }}>
                      {/* Left dot — always the visually left image */}
                      <motion.button
                        type="button"
                        onClick={() => setBookImageIndex(locale === "he" ? 1 : 0)}
                        className="block shrink-0 h-2 rounded-full lg:cursor-pointer lg:hover:opacity-70"
                        variants={dotVariants}
                        animate={bookImageIndex === (locale === "he" ? 1 : 0) ? "active" : "inactive"}
                        style={{
                          backgroundColor: bookImageIndex === (locale === "he" ? 1 : 0) ? "#693430" : "#9ca3af",
                        }}
                        aria-label={t(bookImages[locale === "he" ? 1 : 0].labelKey)}
                      />
                      {/* Right dot — always the visually right image */}
                      <motion.button
                        type="button"
                        onClick={() => setBookImageIndex(locale === "he" ? 0 : 1)}
                        className="block shrink-0 h-2 rounded-full lg:cursor-pointer lg:hover:opacity-70"
                        variants={dotVariants}
                        animate={bookImageIndex === (locale === "he" ? 0 : 1) ? "active" : "inactive"}
                        style={{
                          backgroundColor: bookImageIndex === (locale === "he" ? 0 : 1) ? "#693430" : "#9ca3af",
                        }}
                        aria-label={t(bookImages[locale === "he" ? 0 : 1].labelKey)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          id="how-it-works"
          aria-labelledby="how-it-works-heading"
          className="relative bg-[#FAF7F4] pb-16 lg:pb-24"
          {...reveal.section}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-8 lg:mb-16 pt-8 lg:pt-10">
              <Title
                as="h2"
                id="how-it-works-heading"
                highlightText={t("home.howItWorks.titleHighlight")}
                size="lg"
                className="mb-4 text-[28px] sm:text-3xl"
              >
                {t("home.howItWorks.title")}
              </Title>
            </div>

            {/* Steps - Card Layout */}
            <motion.div
              dir={locale === "he" ? "rtl" : "ltr"}
              className="mx-auto flex max-w-5xl flex-col gap-5 lg:flex-row lg:flex-nowrap lg:gap-6"
              {...reveal.staggerContainer()}
            >
              {howItWorksSteps.map((step) => (
                <motion.div
                  key={step.num}
                  className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white"
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: easeOwlet },
                    },
                  }}
                >
                  {/* Illustration area — top half */}
                  <motion.div
                    className="relative h-[216px] shrink-0 overflow-hidden sm:h-[240px]"
                    {...reveal.imageReveal}
                  >
                    <div className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                      <span className="font-heading text-sm font-bold text-dark-gray">
                        {step.num}
                      </span>
                    </div>
                    <Image
                      src={step.src}
                      alt={t(step.imageAltKey)}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </motion.div>

                  {/* Text area — bottom half */}
                  <div className="flex flex-col items-center px-5 py-5 text-center sm:px-6 sm:py-6">
                    <p className="mb-1 text-sm font-body-bold text-primary-orange">
                      {t(step.labelKey)}
                    </p>
                    <h3 className="mb-2 text-xl font-heading font-bold text-dark-gray">
                      {t(step.titleKey)}
                    </h3>
                    <p className="font-body text-dark-gray leading-relaxed text-base whitespace-pre-line">
                      {t(step.descriptionKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom CTA */}
            <motion.div
              className="text-center mt-10 md:mt-16"
              {...reveal.section}
            >
              <a href="/upload" aria-label={t("home.howItWorks.ctaAriaLabel")}>
                <HomeCtaButton>{t("home.howItWorks.cta")}</HomeCtaButton>
              </a>
            </motion.div>
          </div>
        </motion.section>

        {framedOn && (
          <>
            <FramedArtHomeSection />
          </>
        )}

        {/* Testimonials Section */}
        {/* <TestimonialsSection /> */}

        {/* Why Little Gali Section */}
        <motion.section
          id="special"
          aria-label={t("home.special.ariaLabel")}
          className="relative bg-[#FAF7F4] pb-16 lg:pb-24"
          {...reveal.section}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 pt-8 text-center lg:mb-12 lg:pt-10">
              <Title
                highlightText={t("home.special.titleHighlight")}
                className="mx-auto max-w-3xl text-[28px] sm:text-3xl"
              >
                {t("home.special.title")}
              </Title>
              <p className="mx-auto mt-4 max-w-2xl font-body text-base leading-relaxed text-medium-gray sm:text-lg">
                {t("home.special.subtitleLine1")}
              </p>
            </div>

            <motion.div
              dir={locale === "he" ? "rtl" : "ltr"}
              className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
              {...reveal.staggerContainer({ amount: 0.2, staggerChildren: 0.1 })}
            >
              {specialSteps.map((step) => (
                <motion.div
                  key={step.titleKey}
                  className="flex flex-col items-center rounded-2xl border border-gray-200/80 bg-white px-5 pb-8 pt-3 text-center sm:px-6 sm:pt-4"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: easeOwlet },
                    },
                  }}
                >
                  <div className="mb-3 flex w-full items-center justify-center">
                    <Image
                      src={step.src}
                      alt={t(step.imageAltKey)}
                      width={220}
                      height={220}
                      className="h-[8.4rem] w-[8.4rem] object-contain sm:h-[9.6rem] sm:w-[9.6rem] lg:h-[11rem] lg:w-[11rem]"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="mb-2 font-heading text-base font-bold text-dark-gray sm:text-lg">
                    {t(step.titleKey)}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-medium-gray sm:text-[15px]">
                    {t(step.descriptionKey)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Meet Us Section */}
        <motion.section
          id="about"
          aria-labelledby="about-heading"
          className={`relative bg-white pt-0 ${locale === "en" ? "pb-16 md:pb-20 lg:pb-0" : "pb-6 lg:pb-0"}`}
          {...reveal.section}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid max-w-6xl items-stretch gap-4 lg:grid-cols-2 lg:gap-16 mx-auto">
              {/* Left Column - Image */}
              <motion.div
                className="relative min-h-0 overflow-hidden rounded-3xl lg:h-full"
                {...reveal.imageReveal}
              >
                <div className="relative aspect-[4/3] w-full lg:absolute lg:inset-0 lg:aspect-auto">
                  <Image
                    src="/about-us.jpg"
                    alt={t("home.about.imageAlt")}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </motion.div>

              {/* Right Column - Text Content */}
              <div
                className={`relative ${
                  locale === "en" ? "lg:py-16 lg:pb-20" : "lg:py-12"
                }`}
              >
                {/* Content */}
                <div>
                  <div className="flex flex-col gap-1.5">
                    {/* Brand name */}
                    <div className="text-primary-orange font-body-bold text-sm leading-none tracking-wide">
                      {t("home.about.brand")}
                    </div>

                    {/* Main heading */}
                    <Title
                      as="h2"
                      id="about-heading"
                      highlightText={t("home.about.titleHighlight")}
                      size="lg"
                      className="!leading-none text-[28px] sm:text-3xl"
                    >
                      {t("home.about.title")}
                    </Title>
                  </div>

                  {/* Body text */}
                  <div className="space-y-3 pt-5">
                    {([1, 2, 3, 4] as const).map((n) => (
                      <p
                        key={n}
                        className="font-body text-medium-gray leading-relaxed"
                      >
                        {t(`home.about.paragraph${n}`)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Gift Card Section */}
        <GiftCardSection />

        {/* Q&A Section */}
        <motion.section
          id="qa"
          aria-labelledby="qa-heading"
          className="relative pb-16 lg:pb-24 bg-[#F3EEE8]"
          {...reveal.section}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
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
                {t("home.qa.subtitle")}
              </p>
            </div>

            <QaTabsSection
              className="max-w-4xl mx-auto"
              bookItemIds={[...HOME_BOOK_IDS]}
              framedItemIds={framedOn ? [...HOME_FRAMED_IDS] : undefined}
              hideTabs={!framedOn}
            />

            {/* Button to navigate to Q&A page */}
            <div className="text-center mt-12">
              <div>
                <a href="/qa" aria-label={t("home.qa.ctaAriaLabel")}>
                  <HomeCtaButton>{t("home.qa.cta")}</HomeCtaButton>
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
