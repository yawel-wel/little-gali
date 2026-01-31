"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BOOK_PRICE } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";
import MuiButton from "@mui/material/Button";
import Box from "@mui/material/Box";
import MobileStepper from "@mui/material/MobileStepper";

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
              <Image
                src="/coming-soon.jpg"
                alt="Coming Soon"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 600px"
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
            <p className="text-base font-body text-medium-gray whitespace-pre-line">
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
                  <MuiButton
                    type="submit"
                    disabled={isSubmitting}
                    variant="contained"
                    color="primary"
                    sx={{
                      px: 2.5,
                      py: 0.75,
                      minWidth: "auto",
                      fontFamily: "var(--font-assistant)",
                      fontWeight: 700,
                      fontSize: { xs: "0.85rem", md: "0.9rem" },
                      textTransform: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isSubmitting
                      ? t("home.comingSoon.submitting")
                      : t("home.comingSoon.button")}
                  </MuiButton>
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
                  <MuiButton
                    fullWidth
                    type="submit"
                    disabled={isSubmitting}
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
                    {isSubmitting
                      ? t("home.comingSoon.submitting")
                      : t("home.comingSoon.button")}
                  </MuiButton>
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

// Simple carousel component for dual design section
function DualDesignCarousel() {
  const { t, locale } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = 2;

  const designs = [
    {
      title: t("home.dualDesign.bw.title"),
      description: t("home.dualDesign.bw.description"),
      image: "/black-and-white-example.png",
      bgColor: "#F7F8FA",
    },
    {
      title: t("home.dualDesign.color.title"),
      description: t("home.dualDesign.color.description"),
      image: "/colorful-example.png",
      bgColor: "#FFF7F2",
    },
  ];

  return (
    <Box sx={{ width: "100%", flexGrow: 1 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-4/5 mx-auto"
        >
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: designs[activeStep].bgColor }}
          >
            <h3 className="text-lg font-heading text-dark-gray mb-2 mt-9">
              {designs[activeStep].title}
            </h3>
            <p className="text-xs font-body text-medium-gray mb-4">
              {designs[activeStep].description}
            </p>
            <div className="w-40 h-40 mx-auto overflow-hidden rounded-lg">
              <Image
                src={designs[activeStep].image}
                alt={designs[activeStep].title}
                width={160}
                height={160}
                className="object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <MobileStepper
        variant="dots"
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        sx={{
          background: "transparent",
          justifyContent: "center",
          mt: 2,
          "& .MuiMobileStepper-dot": {
            backgroundColor: "#d1d5db",
          },
          "& .MuiMobileStepper-dotActive": {
            backgroundColor: "#F4A261",
          },
        }}
        nextButton={
          <div
            onClick={() => setActiveStep((prev) => (prev + 1) % maxSteps)}
            style={{ cursor: "pointer", width: 0, height: 0, opacity: 0 }}
          />
        }
        backButton={
          <div
            onClick={() =>
              setActiveStep((prev) => (prev - 1 + maxSteps) % maxSteps)
            }
            style={{ cursor: "pointer", width: 0, height: 0, opacity: 0 }}
          />
        }
      />
      <div className="flex justify-center gap-4 mt-4">
        {[0, 1].map((step) => (
          <button
            key={step}
            onClick={() => setActiveStep(step)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              activeStep === step ? "bg-[#F4A261]" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${step + 1}`}
          />
        ))}
      </div>
    </Box>
  );
}

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const easeOwlet: any = [0.16, 1, 0.3, 1];
  const { t, locale } = useLanguage();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // Check if mobile - starts as null to avoid hydration mismatch
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    const handleResize = () => checkMobile();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle hash scrolling on page load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#F7F5F2" }}>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden pt-[120px]">
          {/* Background Image - positioned top-right */}
          <div className="absolute inset-0">
            <div className="w-full h-full relative">
              <Image
                src="/hero-image.jpeg"
                alt="Baby book example"
                fill
                priority
                className="object-cover sm:object-[center_40%]"
                sizes="100vw"
              />
              {/* Lighter gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/25 to-black/20" />
            </div>
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
                              <motion.svg
                                className="absolute bottom-0 left-0"
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
                                  stroke="rgb(229, 84, 61)"
                                  strokeWidth="8"
                                  fill="none"
                                  strokeLinecap="round"
                                  style={{
                                    filter: "drop-shadow(0 2px 4px rgba(229, 84, 61, 0.3))",
                                  }}
                                />
                              </motion.svg>
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
                          animateUnderline={true}
                        >
                          {titleText}
                        </Title>
                      );
                    }
                  })()}
                </div>
                {/* CTA Button */}
                <div className="pt-6">
                  <div className="relative w-auto">
                    <a href="/upload">
                      <MuiButton
                        variant="contained"
                        color="primary"
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontFamily: "var(--font-assistant)",
                          fontWeight: 700,
                          fontSize: "1rem",
                          textTransform: "none",
                          bgcolor: "transparent",
                          border: "1px solid rgba(255,255,255,0.9)",
                          backdropFilter: "blur(12px)",
                        }}
                      >
                        {t("home.hero.cta")}
                      </MuiButton>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* הספרון שלנו Section */}
        <motion.section
          className="relative -mt-0 py-12 lg:py-16"
          style={{ backgroundColor: "#F7F5F2" }}
          initial={prefersReducedMotion || isMobile === true ? undefined : { opacity: 0, y: 20 }}
          animate={isMobile === false && !prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          whileInView={isMobile === false && !prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.05 }}
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
                    <div>
                      <a href="/upload">
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
                          {t("home.book.cta")}
                        </MuiButton>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Column - Single Image */}
                <div className="order-2 lg:order-2">
                  <div className="w-full">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <motion.div 
                        className="w-full h-full relative"
                        initial={prefersReducedMotion || isMobile === true ? undefined : { scale: 1.08, opacity: 0 }}
                        animate={isMobile === false && !prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
                        whileInView={isMobile === false && !prefersReducedMotion ? { scale: 1, opacity: 1 } : undefined}
                        transition={{ duration: 0.8, ease: easeOwlet }}
                        viewport={{ once: true, amount: 0.3 }}
                      >
                        <Image
                          src="/our-book.jpg"
                          alt="Book showcase"
                          fill
                          className="object-cover"
                          priority
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* How It Works Section */}
        <motion.section
          id="how-it-works"
          className="relative py-16 lg:py-24"
          style={{ backgroundColor: "#F9F7EE" }}
          initial={prefersReducedMotion || isMobile === true ? undefined : { opacity: 0, y: 20 }}
          animate={isMobile === false && !prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          whileInView={isMobile === false && !prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.05 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-8 lg:mb-16">
              <Title
                highlightText={t("home.howItWorks.titleHighlight")}
                size="lg"
                className="mb-4"
              >
                {t("home.howItWorks.title")}
              </Title>
            </div>

            {/* Steps - Side by Side Layout */}
            <motion.div
              className={`flex flex-col lg:flex-row gap-8 lg:gap-0 max-w-6xl mx-auto relative items-start ${
                locale === "he" ? "lg:flex-row-reverse" : ""
              }`}
              initial={prefersReducedMotion || isMobile === true ? undefined : "hidden"}
              animate={isMobile === false && !prefersReducedMotion ? undefined : "show"}
              whileInView={isMobile === false && !prefersReducedMotion ? "show" : undefined}
              viewport={{ once: true, amount: 0.15 }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.15 },
                },
              }}
            >
              {/* Step 2 */}
              <motion.div 
                className="flex-1 text-center order-2 lg:order-none lg:-mr-8"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOwlet } },
                }}
              >
                {/* Step Number */}
                <div className="relative inline-block mb-6">
                  <div
                    className="w-10 h-10 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto border-2 border-dark-gray"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <span className="text-dark-gray font-heading text-lg lg:text-2xl font-bold">
                      2
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-3 max-w-xs mx-auto mb-6">
                  <p className="text-sm font-body-bold text-primary-orange mb-1">
                    {t("home.howItWorks.step2.label")}
                  </p>
                  <h3 className="text-xl lg:text-2xl font-heading text-dark-gray">
                    {t("home.howItWorks.step2.title")}
                  </h3>
                  <p className="font-body text-medium-gray leading-relaxed text-base lg:text-lg">
                    {t("home.howItWorks.step2.description")}
                  </p>
                </div>

                {/* Step Image - Large */}
                <motion.div
                  initial={prefersReducedMotion ? undefined : { scale: 0.95, opacity: 0 }}
                  whileInView={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: easeOwlet, delay: 0.2 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <div className="w-full max-w-md mx-auto aspect-square rounded-lg overflow-hidden">
                    <Image
                      src="/book-example-pencil.jpeg"
                      alt="Transform Images"
                      width={500}
                      height={500}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Step 1 */}
              <motion.div 
                className="flex-1 text-center order-1 lg:order-none lg:-ml-8"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOwlet } },
                }}
              >
                {/* Step Number */}
                <div className="relative inline-block mb-6 lg:mb-6 -mt-6 lg:mt-0">
                  <div
                    className="w-10 h-10 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto border-2 border-dark-gray"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <span className="text-dark-gray font-heading text-lg lg:text-2xl font-bold">
                      1
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-3 max-w-xs mx-auto mb-6">
                  <p className="text-sm font-body-bold text-primary-orange mb-1">
                    {t("home.howItWorks.step1.label")}
                  </p>
                  <h3 className="text-xl lg:text-2xl font-heading text-dark-gray">
                    {t("home.howItWorks.step1.title")}
                  </h3>
                  <p className="font-body text-medium-gray leading-relaxed text-base lg:text-lg">
                    {t("home.howItWorks.step1.description")}
                  </p>
                </div>

                {/* Step Image - Large */}
                <motion.div
                  initial={prefersReducedMotion ? undefined : { scale: 0.95, opacity: 0 }}
                  whileInView={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: easeOwlet, delay: 0.2 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <div className="w-full max-w-md mx-auto aspect-square rounded-lg overflow-hidden">
                    <Image
                      src="/upload-images.png"
                      alt="Upload Images"
                      width={500}
                      height={500}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Bottom CTA */}
            <motion.div 
              className="text-center mt-16"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOwlet, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <a href="/upload">
                <MuiButton
                  variant="contained"
                  color="primary"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontFamily: "var(--font-assistant)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    textTransform: "none",
                  }}
                >
                  {t("home.howItWorks.cta")}
                </MuiButton>
              </a>
            </motion.div>
          </div>
        </motion.section>

        {/* Dual Design Section */}
        <motion.section
          className="relative bg-white py-8 lg:py-12"
          initial={prefersReducedMotion || isMobile === true ? undefined : { opacity: 0, y: 20 }}
          animate={isMobile === false && !prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          whileInView={isMobile === false && !prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.05 }}
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
                  <div className="w-full h-full relative">
                    <Image
                      src="/original-example.jpeg"
                      alt="Original Example"
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="128px"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Carousel */}
              <div className="md:hidden pt-12">
                <DualDesignCarousel />
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-2 gap-0 relative">
                {/* Left Side - Black and White */}
                <div
                  className="rounded-l-2xl p-8 text-center relative pt-16"
                  style={{ backgroundColor: "#F7F8FA" }}
                >
                  <h3 className="text-xl font-heading text-dark-gray mb-2">
                    {t("home.dualDesign.bw.title")}
                  </h3>
                  <p className="text-sm font-body text-medium-gray mb-4">
                    {t("home.dualDesign.bw.description")}
                  </p>
                  <div className="w-56 h-56 mx-auto">
                    <Image
                      src="/black-and-white-example.png"
                      alt="Black and White Example"
                      width={224}
                      height={224}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Right Side - Colorful */}
                <div
                  className="rounded-r-2xl p-8 text-center relative pt-16"
                  style={{ backgroundColor: "#FFF7F2" }}
                >
                  <h3 className="text-xl font-heading text-dark-gray mb-2">
                    {t("home.dualDesign.color.title")}
                  </h3>
                  <p className="text-sm font-body text-medium-gray mb-4">
                    {t("home.dualDesign.color.description")}
                  </p>
                  <div className="w-56 h-56 mx-auto">
                    <Image
                      src="/colorful-example.png"
                      alt="Colorful Example"
                      width={224}
                      height={224}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                </div>
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
          initial={prefersReducedMotion || isMobile === true ? undefined : { opacity: 0, y: 20 }}
          animate={isMobile === false && !prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          whileInView={isMobile === false && !prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.05 }}
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
              initial={prefersReducedMotion || isMobile === true ? undefined : "hidden"}
              animate={isMobile === false && !prefersReducedMotion ? undefined : "show"}
              whileInView={isMobile === false && !prefersReducedMotion ? "show" : undefined}
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              {/* Column 1 */}
              <motion.div 
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOwlet } },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6 relative">
                  <Image
                    src="/couple.png"
                    alt="Couple"
                    fill
                    className="object-cover rounded-lg"
                    loading="lazy"
                    sizes="(max-width: 768px) 144px, 256px"
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
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOwlet } },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6 relative">
                  <Image
                    src="/sister.png"
                    alt="Young Sister"
                    fill
                    className="object-cover rounded-lg"
                    loading="lazy"
                    sizes="(max-width: 768px) 144px, 256px"
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
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOwlet } },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6 relative">
                  <Image
                    src="/parent-and-son.png"
                    alt="Parent and Son"
                    fill
                    className="object-cover rounded-lg"
                    loading="lazy"
                    sizes="(max-width: 768px) 144px, 256px"
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
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOwlet } },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6 relative">
                  <Image
                    src="/dad-and-son.png"
                    alt="Dad and Son"
                    fill
                    className="object-cover rounded-lg"
                    loading="lazy"
                    sizes="(max-width: 768px) 144px, 256px"
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
          initial={prefersReducedMotion || isMobile === true ? undefined : { opacity: 0, y: 20 }}
          animate={isMobile === false && !prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          whileInView={isMobile === false && !prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.05 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
              {/* Left Column - Image */}
              <motion.div 
                className="relative rounded-3xl overflow-hidden"
                initial={prefersReducedMotion || isMobile === true ? undefined : { scale: 0.95, opacity: 0 }}
                animate={isMobile === false && !prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
                whileInView={isMobile === false && !prefersReducedMotion ? { scale: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.7, ease: easeOwlet, delay: 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="w-full aspect-[4/3] relative">
                  <Image
                    src="/about-us.jpg"
                    alt="About Us"
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </motion.div>

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
          initial={prefersReducedMotion || isMobile === true ? undefined : { opacity: 0, y: 20 }}
          animate={isMobile === false && !prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          whileInView={isMobile === false && !prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.05 }}
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
              <div>
                <a href="/qa">
                  <MuiButton
                    variant="contained"
                    color="primary"
                    sx={{
                      px: 3,
                      py: 1.25,
                      fontFamily: "var(--font-assistant)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      textTransform: "none",
                    }}
                  >
                    {t("home.qa.cta")}
                  </MuiButton>
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
