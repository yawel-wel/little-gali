"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BOOK_PRICE } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";

function ComingSoonSection({
  prefersReducedMotion,
  easeOwlet,
}: {
  prefersReducedMotion: boolean | null;
  easeOwlet: any;
}) {
  const { locale, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubmitStatus({
        type: "error",
        message: t("home.comingSoon.error"),
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/email-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: data.message || t("home.comingSoon.success"),
        });
        setEmail("");
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || t("home.comingSoon.errorGeneric"),
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: t("home.comingSoon.errorGeneric"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      className="relative py-16 lg:py-24"
      style={{ backgroundColor: "#F3EEE8" }}
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
          className="max-w-3xl mx-auto text-center"
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
          {/* Main Heading - Largest, Most Prominent */}
          <motion.div
            className="mb-8"
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
              highlightText={t("home.comingSoon.titleHighlight")}
              size="xl"
              className="text-center"
            >
              {t("home.comingSoon.title")}
            </Title>
          </motion.div>

          {/* Image */}
          <div className="flex justify-center my-8">
            <motion.div
              className="w-full max-w-md rounded-lg overflow-hidden shadow-lg"
              initial={
                prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }
              }
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }
              }
              transition={{ duration: 0.8, ease: easeOwlet, delay: 0.2 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3, ease: easeOwlet },
              }}
            >
              <img
                src="/coming-soon.jpg"
                alt="Coming Soon"
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </div>

          {/* Product Name - Secondary, Medium-Large */}
          <motion.div
            className="mb-4 mt-5"
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: easeOwlet },
              },
            }}
          >
            <h3 className="text-xl md:text-2xl font-heading font-bold text-dark-gray">
              {t("home.comingSoon.productName")}
            </h3>
          </motion.div>

          {/* Description/CTA Text - Tertiary, Regular Body */}
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
            <p className="text-base font-body text-medium-gray">
              {t("home.comingSoon.subtitle")}
            </p>
          </motion.div>

          {/* Email Form or Success Message */}
          <AnimatePresence mode="wait">
            {submitStatus.type === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: easeOwlet }}
                className="max-w-[500px] mx-auto"
              >
                {/* Success Card Container */}
                <div
                  className="rounded-2xl border-2 border-dashed border-primary-orange bg-[#FAFAF9] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-8 md:p-10"
                  style={{ borderColor: "#E16854" }}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Checkmark Icon */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        ease: easeOwlet,
                        delay: 0.1,
                      }}
                      className="w-12 h-12 rounded-full bg-primary-orange flex items-center justify-center shadow-lg mb-3"
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </motion.div>

                    {/* Thank You Title */}
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: easeOwlet,
                        delay: 0.2,
                      }}
                      className="text-xl md:text-2xl font-heading font-bold text-dark-gray mb-2"
                    >
                      {t("home.comingSoon.successTitle")}
                    </motion.h3>

                    {/* Success Message */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: easeOwlet,
                        delay: 0.3,
                      }}
                      className="text-base font-body text-medium-gray"
                    >
                      {t("home.comingSoon.successMessage")}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="max-w-lg mx-auto"
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: easeOwlet },
                  },
                }}
              >
                {/* Desktop: Horizontal Layout */}
                <div
                  className={`hidden md:flex md:items-center md:justify-center md:gap-4 ${
                    locale === "en" ? "flex-row" : "flex-row"
                  }`}
                >
                  <div className="flex-1 max-w-[350px]">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("home.comingSoon.emailPlaceholder")}
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white border-[1.5px] border-gray-300 rounded-lg px-4 py-3.5 text-base font-body focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                      dir={locale === "en" ? "ltr" : "rtl"}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-full font-body-bold text-base md:text-lg transition-all duration-200 whitespace-nowrap"
                  >
                    {isSubmitting
                      ? t("home.comingSoon.submitting")
                      : t("home.comingSoon.button")}
                  </Button>
                </div>

                {/* Mobile: Vertical Layout */}
                <div className="md:hidden space-y-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("home.comingSoon.emailPlaceholder")}
                    required
                    disabled={isSubmitting}
                    className="w-full bg-white border-[1.5px] border-gray-300 rounded-lg px-4 py-3.5 text-base font-body focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                    dir={locale === "en" ? "ltr" : "rtl"}
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cursor-pointer bg-primary-orange hover:bg-primary-orange/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-full font-body-bold text-base transition-all duration-200"
                  >
                    {isSubmitting
                      ? t("home.comingSoon.submitting")
                      : t("home.comingSoon.button")}
                  </Button>
                </div>

                {/* Error Message */}
                {submitStatus.type === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <p className="text-base font-body text-red-600">
                      {submitStatus.message}
                    </p>
                  </motion.div>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -8]);
  const easeOwlet: any = [0.16, 1, 0.3, 1];
  const { t, locale } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle hash scrolling on page load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          const yOffset = -80; // Offset for header
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const clickHandlers: Array<{
      element: Element;
      handler: (e: Event) => void;
    }> = [];
    const touchHandlers: Array<{
      element: Element;
      handlers: { event: string; handler: (e: Event) => void }[];
    }> = [];

    let currentSlide = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;

    function goToSlide(
      index: number,
      container: HTMLElement,
      dots: NodeListOf<Element>
    ) {
      currentSlide = index;

      // Update active dot
      dots.forEach((d, i) => {
        if (i === index) {
          d.className =
            "w-3 h-3 rounded-full bg-[#F4A261] transition-all duration-200 cursor-pointer";
        } else {
          d.className =
            "w-3 h-3 rounded-full bg-gray-300 hover:bg-[#F4A261] transition-all duration-200 cursor-pointer";
        }
      });

      // Move carousel
      if (index === 0) {
        container.style.transform = "translateX(0%)";
      } else if (index === 1) {
        container.style.transform = "translateX(60%)";
      }
    }

    function initCarousel() {
      const container = document.getElementById("carousel-container");
      const dots = document.querySelectorAll("[data-slide]");

      if (container && dots.length > 0) {
        // Set initial position to show first slide
        goToSlide(0, container, dots);

        // Dot click handlers
        dots.forEach((dot, index) => {
          const handler = (e: Event) => {
            e.preventDefault();
            goToSlide(index, container, dots);
          };

          dot.addEventListener("click", handler);
          clickHandlers.push({ element: dot, handler });
        });

        // Touch/swipe handlers for mobile
        const touchStartHandler = (e: TouchEvent) => {
          touchStartX = e.touches[0].clientX;
          touchEndX = touchStartX;
          isDragging = true;
          container.style.transition = "none";
        };

        const touchMoveHandler = (e: TouchEvent) => {
          if (!isDragging) return;

          touchEndX = e.touches[0].clientX;
          const diff = touchStartX - touchEndX;

          // Only prevent default if swiping horizontally
          if (Math.abs(diff) > 10) {
            e.preventDefault();
          }

          // Calculate current position
          const currentTranslate = currentSlide === 0 ? 0 : 60;
          const newTranslate =
            currentTranslate + (diff / container.offsetWidth) * 100;

          // Constrain movement
          const minTranslate = 0;
          const maxTranslate = 60;
          const constrainedTranslate = Math.max(
            minTranslate,
            Math.min(maxTranslate, newTranslate)
          );

          container.style.transform = `translateX(${constrainedTranslate}%)`;
        };

        const touchEndHandler = () => {
          if (!isDragging) return;
          isDragging = false;
          container.style.transition = "transform 0.3s ease-in-out";

          const swipeDistance = touchStartX - touchEndX;
          const swipeThreshold = 50; // Minimum distance for swipe

          if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0 && currentSlide > 0) {
              // Swipe left - go to previous slide
              goToSlide(currentSlide - 1, container, dots);
            } else if (swipeDistance < 0 && currentSlide < 1) {
              // Swipe right - go to next slide
              goToSlide(currentSlide + 1, container, dots);
            } else {
              // Return to current slide
              goToSlide(currentSlide, container, dots);
            }
          } else {
            // Return to current slide if swipe wasn't significant
            goToSlide(currentSlide, container, dots);
          }
        };

        container.addEventListener(
          "touchstart",
          touchStartHandler as EventListener
        );
        container.addEventListener(
          "touchmove",
          touchMoveHandler as EventListener
        );
        container.addEventListener(
          "touchend",
          touchEndHandler as EventListener
        );

        touchHandlers.push({
          element: container,
          handlers: [
            {
              event: "touchstart",
              handler: touchStartHandler as EventListener,
            },
            { event: "touchmove", handler: touchMoveHandler as EventListener },
            { event: "touchend", handler: touchEndHandler as EventListener },
          ],
        });
      } else {
        timeoutId = setTimeout(initCarousel, 100);
      }
    }

    // Initialize carousel after component mounts
    initCarousel();

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      clickHandlers.forEach(({ element, handler }) => {
        element.removeEventListener("click", handler);
      });
      touchHandlers.forEach(({ element, handlers }) => {
        handlers.forEach(({ event, handler }) => {
          element.removeEventListener(event, handler);
        });
      });
    };
  }, []);
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden pt-[72px] pb-24 sm:pb-0">
          {/* Background Image - positioned top-right */}
          <div className="absolute inset-0">
            <motion.img
              src="/hero-image.jpeg"
              alt="Baby book example"
              className="w-full h-full object-cover sm:object-[center_40%]"
              style={{ y: prefersReducedMotion ? 0 : heroY }}
              initial={prefersReducedMotion ? false : { scale: 1.2 }}
              animate={
                prefersReducedMotion
                  ? undefined
                  : { scale: isMobile ? 1.5 : 1.0 }
              }
              transition={{ duration: 5, ease: easeOwlet }}
            />
            {/* Lighter gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/25 to-black/20" />
          </div>
          {/* Content Overlay - center-aligned */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-5 md:space-y-6 max-w-2xl mx-auto">
                {/* Title - centered with better contrast */}
                <div className="relative px-4">
                  {(() => {
                    const titleText = t("home.hero.title");
                    const highlightText = t("home.hero.titleHighlight");
                    const titleParts = titleText.split("|");

                    if (titleParts.length === 2) {
                      // Hebrew: split into two lines
                      const [line1, line2] = titleParts;
                      const highlightIndex = line2.indexOf(highlightText);

                      if (highlightIndex !== -1) {
                        const beforeHighlight = line2.substring(
                          0,
                          highlightIndex
                        );
                        const afterHighlight = line2.substring(
                          highlightIndex + highlightText.length
                        );

                        return (
                          <h2 className="text-[34px] sm:text-5xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] text-white">
                            {line1}
                            <br />
                            {beforeHighlight}
                            <span className="relative inline-block">
                              <span className="relative z-10">
                                {highlightText}
                              </span>
                              <span
                                className="absolute bottom-0 left-0 right-0 transform -rotate-1"
                                style={{
                                  height: "8px",
                                  borderRadius: "6px 6px 0 0",
                                  transform: "rotate(-2deg) translateY(0px)",
                                  background:
                                    "linear-gradient(90deg, rgba(229, 84, 61, 0.6) 0%, rgba(229, 84, 61, 0.8) 50%, rgba(229, 84, 61, 0.6) 100%)",
                                  boxShadow: "0 2px 4px rgba(229, 84, 61, 0.3)",
                                  width: "110%",
                                  left: "-5%",
                                }}
                              ></span>
                            </span>
                            {afterHighlight}
                          </h2>
                        );
                      } else {
                        // Fallback if highlight not found in second line
                        return (
                          <h2 className="text-[34px] sm:text-5xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] text-white">
                            {line1}
                            <br />
                            {line2}
                          </h2>
                        );
                      }
                    } else {
                      // English or other: use Title component as before
                      return (
                        <Title
                          highlightText={highlightText}
                          color="text-white"
                          className="text-[34px] sm:text-5xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                        >
                          {titleText}
                        </Title>
                      );
                    }
                  })()}
                </div>
                {/* CTA Button */}
                <div className="pt-6">
                  <motion.div
                    className="fixed bottom-4 left-1/2 w-[calc(100%-32px)] max-w-md -translate-x-1/2 z-40 sm:relative sm:bottom-auto sm:left-auto sm:w-auto sm:max-w-none sm:translate-x-0"
                    whileHover={{
                      scale: 1.05,
                      y: -2,
                      transition: { duration: 0.2, ease: easeOwlet },
                    }}
                  >
                    <a href="/upload">
                      <Button
                        size="lg"
                        className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-10 py-4 rounded-full font-body-bold text-base md:text-lg transition-all duration-200 shadow-2xl w-full sm:w-auto"
                      >
                        {t("home.hero.cta")}
                      </Button>
                    </a>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* הספרון שלנו Section */}
        <motion.section
          className="relative bg-white py-12 lg:py-16"
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
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Column - Text Content */}
                <div className="order-1 lg:order-1 space-y-6">
                  {/* Title with Highlight */}
                  <div className="-mt-3">
                    <Title
                      highlightText={t("home.book.titleHighlight")}
                      className={`text-3xl lg:text-4xl ${
                        locale === "en"
                          ? "text-center lg:text-left"
                          : "text-center lg:text-right"
                      }`}
                    >
                      {t("home.book.title")}
                    </Title>
                  </div>

                  {/* Subtitle */}
                  <div
                    className={`-mt-1 ${
                      locale === "en"
                        ? "text-center lg:text-left"
                        : "text-center lg:text-right"
                    }`}
                  >
                    <h3 className="text-xl lg:text-2xl font-heading text-dark-gray">
                      {t("home.book.subtitle")}
                    </h3>
                  </div>

                  {/* Description Text */}
                  <div
                    className={`space-y-3 ${
                      locale === "en"
                        ? "text-center lg:text-left"
                        : "text-center lg:text-right"
                    }`}
                  >
                    <p className="font-body text-medium-gray leading-relaxed whitespace-pre-line">
                      {t("home.book.description")}
                    </p>
                  </div>

                  {/* Price */}
                  {/* Price - Underlined Elegant */}
                  <div className="flex flex-col items-center lg:items-start gap-1">
                    <div className="relative">
                      <span className="text-sm font-body text-medium-gray mt-1 block">
                        {t("home.book.price")}
                      </span>
                      <div className="flex items-baseline pb-1">
                        <span className="text-4xl font-heading font-light text-dark-gray">
                          {BOOK_PRICE}
                        </span>
                        <span className="text-2xl font-bodye">₪</span>
                      </div>
                      <div
                        className={`absolute bottom-0 w-24 h-0.5 ${
                          locale === "en"
                            ? "left-0 bg-gradient-to-r from-primary-orange to-transparent"
                            : "right-0 bg-gradient-to-l from-primary-orange to-transparent"
                        }`}
                      ></div>
                    </div>
                    <div className="flex items-center gap-2 font-body text-medium-gray">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{t("home.book.secondBook")}</span>
                    </div>
                    <p className="text-sm font-body text-medium-gray mt-1">
                      {t("home.book.discountNote")}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="flex justify-center lg:justify-start pt-2">
                    <motion.div
                      whileHover={{
                        scale: 1.01,
                        y: -1,
                        transition: { duration: 0.2, ease: easeOwlet },
                      }}
                    >
                      <a href="/upload">
                        <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-5 rounded-full font-body-bold text-base transition-all duration-200">
                          {t("home.book.cta")}
                        </Button>
                      </a>
                    </motion.div>
                  </div>
                </div>

                {/* Right Column - Single Image */}
                <div className="order-2 lg:order-2">
                  <div className="w-full">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <motion.img
                        src="/our-book.jpg"
                        alt="Book showcase"
                        className="w-full h-full object-cover"
                        initial={prefersReducedMotion ? false : { scale: 1.12 }}
                        whileInView={
                          prefersReducedMotion ? undefined : { scale: 1 }
                        }
                        transition={{ duration: 2.2, ease: easeOwlet }}
                        viewport={{ once: true, amount: 0.25 }}
                        whileHover={{
                          scale: 1.04,
                          transition: { duration: 0.5, ease: easeOwlet },
                        }}
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
          className="relative py-16 lg:py-24"
          style={{ backgroundColor: "#F9F7EE" }}
          initial={
            prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }
          }
          whileInView={
            prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: 0.9, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-16">
              <Title
                highlightText={t("home.howItWorks.titleHighlight")}
                size="lg"
                className="mb-4"
              >
                {t("home.howItWorks.title")}
              </Title>
              <p className="text-lg font-body text-medium-gray max-w-2xl mx-auto">
                {t("home.howItWorks.subtitle")}
              </p>
            </div>

            {/* Steps Grid */}
            <motion.div
              className="flex flex-col md:grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto space-y-12 md:space-y-0 px-3 md:px-0"
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView={prefersReducedMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.15 }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.2 },
                },
              }}
            >
              {/* Step 1 */}
              <motion.div
                className="text-center relative"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.2, ease: easeOwlet },
                  },
                }}
              >
                {/* Step Image */}
                <div className="mb-4">
                  <motion.div
                    className="w-64 md:w-56 h-64 md:h-56 mx-auto p-3 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                    style={{ backgroundColor: "#F3EEE8" }}
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      },
                    }}
                  >
                    <img
                      src="/upload-images.jpg"
                      alt="Upload Images"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </div>

                {/* Step Number */}
                <div className="relative inline-block mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "#FFD8D0" }}
                  >
                    <span className="text-dark-gray font-heading text-base font-bold">
                      1
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-4 mt-3 max-w-sm mx-auto">
                  {/* Step Text */}
                  <div className="mb-1">
                    <p className="text-primary-orange text-sm font-body-bold">
                      {t("home.howItWorks.step1.label")}
                    </p>
                  </div>

                  <h3 className="text-xl font-heading text-dark-gray">
                    {t("home.howItWorks.step1.title")}
                  </h3>
                  <p className="font-body text-medium-gray leading-relaxed">
                    {t("home.howItWorks.step1.description")}
                  </p>
                </div>

                {/* Connecting line to next step */}
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary-orange to-soft-peach opacity-30"></div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                className="text-center relative"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.2, ease: easeOwlet },
                  },
                }}
              >
                {/* Step Image */}
                <div className="mb-4">
                  <motion.div
                    className="w-64 md:w-56 h-64 md:h-56 mx-auto p-3 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                    style={{ backgroundColor: "#F3EEE8" }}
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      },
                    }}
                  >
                    <img
                      src="/transform-images.png"
                      alt="Transform Images"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </div>

                {/* Step Number */}
                <div className="relative inline-block mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "#FFD8D0" }}
                  >
                    <span className="text-dark-gray font-heading text-base font-bold">
                      2
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-4 mt-3 max-w-sm mx-auto">
                  {/* Step Text */}
                  <div className="mb-1">
                    <p className="text-primary-orange text-sm font-body-bold">
                      {t("home.howItWorks.step2.label")}
                    </p>
                  </div>

                  <h3 className="text-xl font-heading text-dark-gray">
                    {t("home.howItWorks.step2.title")}
                  </h3>
                  <p className="font-body text-medium-gray leading-relaxed">
                    {t("home.howItWorks.step2.description")}
                  </p>
                </div>

                {/* Connecting line to next step */}
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-soft-peach to-soft-blue opacity-30"></div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                className="text-center relative"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.2, ease: easeOwlet },
                  },
                }}
              >
                {/* Step Image */}
                <div className="mb-4">
                  <motion.div
                    className="w-64 md:w-56 h-64 md:h-56 mx-auto p-3 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                    style={{ backgroundColor: "#F3EEE8" }}
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      },
                    }}
                  >
                    <img
                      src="/print-book.png"
                      alt="Print Book"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </div>

                {/* Step Number */}
                <div className="relative inline-block mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "#FFD8D0" }}
                  >
                    <span className="text-dark-gray font-heading text-base font-bold">
                      3
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-4 mt-3 max-w-sm mx-auto">
                  {/* Step Text */}
                  <div className="mb-1">
                    <p className="text-primary-orange text-sm font-body-bold">
                      {t("home.howItWorks.step3.label")}
                    </p>
                  </div>

                  <h3 className="text-xl font-heading text-dark-gray">
                    {t("home.howItWorks.step3.title")}
                  </h3>
                  <p className="font-body text-medium-gray leading-relaxed">
                    {t("home.howItWorks.step3.description")}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <motion.div
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  transition: { type: "spring", stiffness: 200, damping: 20 },
                }}
              >
                <a href="/upload">
                  <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-4 rounded-full font-body-bold text-lg transition-all duration-200">
                    {t("home.howItWorks.cta")}
                  </Button>
                </a>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Dual Design Section */}
        <motion.section
          className="relative bg-white py-8 lg:py-12"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-8">
              <Title
                highlightText={t("home.dualDesign.titleHighlight")}
                size="sm"
                className="max-w-2xl mx-auto"
              >
                {t("home.dualDesign.title")}
              </Title>
              <p className="text-base sm:text-lg font-body text-medium-gray leading-relaxed max-w-xl mx-auto mt-4">
                {t("home.dualDesign.description")}
              </p>
            </div>

            {/* Mobile Carousel / Desktop Grid */}
            <div className="max-w-4xl mx-auto relative mt-16 md:mt-24">
              {/* Center Image - Overlapping both mobile and desktop */}
              <div
                className="absolute top-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 md:top-0 md:-translate-y-3/4"
                style={{ top: "38px" }}
              >
                <div className="w-26 h-26 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <motion.img
                    src="/original-example.jpeg"
                    alt="Original Example"
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 3.5, ease: easeOwlet }}
                  />
                </div>
              </div>

              {/* Mobile Carousel */}
              <div className="md:hidden">
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-300 ease-in-out pt-12 cursor-grab active:cursor-grabbing"
                    id="carousel-container"
                    style={{ touchAction: "pan-x pan-y" }}
                  >
                    {/* Slide 1 - Black and White (Left) */}
                    <div className="w-4/5 flex-shrink-0 pr-4">
                      <motion.div
                        className="rounded-2xl p-6 text-center"
                        style={{ backgroundColor: "#F7F8FA" }}
                        whileHover={{
                          scale: 1.02,
                          y: -2,
                          boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                          transition: {
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          },
                        }}
                      >
                        <h3 className="text-lg font-heading text-dark-gray mb-2 mt-9 md:mt-0">
                          {t("home.dualDesign.bw.title")}
                        </h3>
                        <p className="text-xs font-body text-medium-gray mb-4">
                          {t("home.dualDesign.bw.description")}
                        </p>
                        <div className="w-40 h-40 mx-auto overflow-hidden rounded-lg">
                          <motion.img
                            src="/black-and-white-example.png"
                            alt="Black and White Example"
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.06 }}
                            transition={{ duration: 3.5, ease: easeOwlet }}
                          />
                        </div>
                      </motion.div>
                    </div>

                    {/* Slide 2 - Colorful (Right) */}
                    <div className="w-4/5 flex-shrink-0 pr-4">
                      <motion.div
                        className="rounded-2xl p-6 text-center"
                        style={{ backgroundColor: "#FFF7F2" }}
                        whileHover={{
                          scale: 1.02,
                          y: -2,
                          boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                          transition: {
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          },
                        }}
                      >
                        <h3 className="text-lg font-heading text-dark-gray mb-2 mt-9 md:mt-0">
                          {t("home.dualDesign.color.title")}
                        </h3>
                        <p className="text-xs font-body text-medium-gray mb-4">
                          {t("home.dualDesign.color.description")}
                        </p>
                        <div className="w-40 h-40 mx-auto overflow-hidden rounded-lg">
                          <motion.img
                            src="/colorful-example.png"
                            alt="Colorful Example"
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.06 }}
                            transition={{ duration: 3.5, ease: easeOwlet }}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    className="cursor-pointer w-3 h-3 rounded-full bg-[#F4A261] transition-all duration-200"
                    data-slide="0"
                  ></button>
                  <button
                    className="cursor-pointer w-3 h-3 rounded-full bg-gray-300 hover:bg-[#F4A261] transition-all duration-200"
                    data-slide="1"
                  ></button>
                </div>
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-2 gap-0 relative">
                {/* Left Side - Black and White */}
                <motion.div
                  className="rounded-l-2xl p-8 text-center relative pt-16"
                  style={{ backgroundColor: "#F7F8FA" }}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                  whileInView={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <h3 className="text-xl font-heading text-dark-gray mb-2">
                    {t("home.dualDesign.bw.title")}
                  </h3>
                  <p className="text-sm font-body text-medium-gray mb-4">
                    {t("home.dualDesign.bw.description")}
                  </p>
                  <motion.div
                    className="w-56 h-56 mx-auto"
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      },
                    }}
                  >
                    <img
                      src="/black-and-white-example.png"
                      alt="Black and White Example"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </motion.div>
                </motion.div>

                {/* Right Side - Colorful */}
                <motion.div
                  className="rounded-r-2xl p-8 text-center relative pt-16"
                  style={{ backgroundColor: "#FFF7F2" }}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                  whileInView={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <h3 className="text-xl font-heading text-dark-gray mb-2">
                    {t("home.dualDesign.color.title")}
                  </h3>
                  <p className="text-sm font-body text-medium-gray mb-4">
                    {t("home.dualDesign.color.description")}
                  </p>
                  <motion.div
                    className="w-56 h-56 mx-auto"
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      },
                    }}
                  >
                    <img
                      src="/colorful-example.png"
                      alt="Colorful Example"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Link to more examples */}
            <div className="text-center mt-8">
              <p className="text-sm font-body text-medium-gray">
                {t("home.dualDesign.moreExamples")}{" "}
                <a
                  href="/inspiration"
                  className="text-primary-orange hover:text-primary-orange/80 underline cursor-pointer transition-colors duration-200"
                >
                  {t("home.dualDesign.moreExamplesLink")}
                </a>
              </p>
            </div>
          </div>
        </motion.section>

        {/* Choose Your Path Section */}
        <motion.section
          className="relative bg-[#F3EEE8] py-16 lg:py-24"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-12">
              <Title
                highlightText={t("home.special.titleHighlight")}
                className="max-w-3xl mx-auto"
              >
                {t("home.special.title")}
              </Title>
            </div>

            {/* 4 Column Grid */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto"
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView={prefersReducedMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.25 }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.15 },
                },
              }}
            >
              {/* Column 1 */}
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.1, ease: easeOwlet },
                  },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/couple.png"
                    alt="Couple"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2 text-[1.2em] md:text-lg">
                  {t("home.special.item1.title")}
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed max-w-[280px] md:max-w-none mx-auto">
                  {t("home.special.item1.description")}
                </p>
              </motion.div>

              {/* Column 2 */}
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.1, ease: easeOwlet },
                  },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/sister.png"
                    alt="Young Sister"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2 text-[1.2em] md:text-lg">
                  {t("home.special.item2.title")}
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed max-w-[280px] md:max-w-none mx-auto">
                  {t("home.special.item2.description")}
                </p>
              </motion.div>

              {/* Column 3 */}
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.1, ease: easeOwlet },
                  },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/parent-and-son.png"
                    alt="Parent and Son"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2 text-[1.2em] md:text-lg">
                  {t("home.special.item3.title")}
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed max-w-[280px] md:max-w-none mx-auto">
                  {t("home.special.item3.description")}
                </p>
              </motion.div>

              {/* Column 4 */}
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.1, ease: easeOwlet },
                  },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/dad-and-son.png"
                    alt="Dad and Son"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2 text-[1.2em] md:text-lg">
                  {t("home.special.item4.title")}
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed max-w-[280px] md:max-w-none mx-auto">
                  {t("home.special.item4.description")}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Meet Us Section */}
        <motion.section
          id="about"
          className="relative bg-white pb-6"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
              {/* Left Column - Image */}
              <div className="relative rounded-3xl overflow-hidden">
                <motion.img
                  src="/about-us.jpg"
                  alt="About Us"
                  className="w-full h-auto"
                  initial={prefersReducedMotion ? false : { scale: 1 }}
                  whileInView={
                    prefersReducedMotion ? undefined : { scale: 1.06 }
                  }
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 2.5, ease: easeOwlet }}
                  viewport={{ once: true, amount: 0.4 }}
                />
              </div>

              {/* Right Column - Text Content */}
              <div className="relative">
                {/* Content */}
                <div className="space-y-4">
                  {/* Brand name */}
                  <div className="text-primary-orange font-body-bold text-sm uppercase tracking-wide mb-0">
                    {t("home.about.brand")}
                  </div>

                  {/* Main heading */}
                  <Title
                    highlightText={t("home.about.titleHighlight")}
                    size="lg"
                  >
                    {t("home.about.title")}
                  </Title>

                  {/* Body text */}
                  <div className="space-y-3 pt-2">
                    <p className="font-body text-medium-gray leading-relaxed">
                      {t("home.about.paragraph1")}
                    </p>
                    <p className="font-body text-medium-gray leading-relaxed">
                      {t("home.about.paragraph2")}
                    </p>
                    <p className="font-body text-medium-gray leading-relaxed">
                      {t("home.about.paragraph3")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Coming Soon Section */}
        <ComingSoonSection
          prefersReducedMotion={prefersReducedMotion}
          easeOwlet={easeOwlet}
        />

        {/* Q&A Section */}
        <motion.section
          id="qa"
          className="relative py-16 lg:py-24"
          style={{ backgroundColor: "#F9F7EE" }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-16">
              <Title
                highlightText={t("home.qa.titleHighlight")}
                size="lg"
                className="mb-4"
              >
                {t("home.qa.title")}
              </Title>
              <p className="text-lg font-body text-medium-gray max-w-2xl mx-auto">
                {t("home.qa.subtitle")}
              </p>
            </div>

            {/* Accordion */}
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem
                  value="item-1"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger
                    className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("qa.question1")}
                  </AccordionTrigger>
                  <AccordionContent
                    className={`font-body text-medium-gray leading-relaxed pt-4 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("qa.answer1")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-2"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger
                    className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("qa.question2")}
                  </AccordionTrigger>
                  <AccordionContent
                    className={`font-body text-medium-gray leading-relaxed pt-4 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("qa.answer2")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-3"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger
                    className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("qa.question3")}
                  </AccordionTrigger>
                  <AccordionContent
                    className={`font-body text-medium-gray leading-relaxed pt-4 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("qa.answer3")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-9"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger
                    className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("qa.question9")}
                  </AccordionTrigger>
                  <AccordionContent
                    className={`font-body text-medium-gray leading-relaxed pt-4 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("qa.answer9")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Button to navigate to Q&A page */}
            <div className="text-center mt-12">
              <motion.div
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  transition: { type: "spring", stiffness: 200, damping: 20 },
                }}
              >
                <a href="/qa">
                  <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-3 rounded-full font-body-bold text-sm transition-all duration-200">
                    {t("home.qa.cta")}
                  </Button>
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
