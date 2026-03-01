"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";
import MuiButton from "@mui/material/Button";

import "swiper/css";
import "swiper/css/free-mode";

const easeOwlet = [0.16, 1, 0.3, 1];

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

// Skeleton Loader Component
function ImageSkeleton() {
  return (
    <div className="absolute inset-0 bg-gray-200 animate-pulse">
      <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_2s_ease-in-out_infinite]" style={{ backgroundSize: '200% 100%' }} />
    </div>
  );
}

type StyleType = "cartoon" | "pencil" | "watercolor";

interface StyleExample {
  input: string;
  output: string;
  inputAlt: string;
  outputAlt: string;
}

// Define style examples - using actual images from /public (now 3 per style)
const styleExamples: Record<StyleType, StyleExample[]> = {
  cartoon: [
    {
      input: "/hadar-and-ofir-original-image.jpg",
      output: "/cartoon-output-image-1.png",
      inputAlt: "Original brother and sister photo",
      outputAlt: "Cartoon style result for brother and sister",
    },
    {
      input: "/group-friends-original-image.jpg",
      output: "/cartoon-output-image-2.png",
      inputAlt: "Original group of friends photo",
      outputAlt: "Cartoon style result for group of friends",
    },
    {
      input: "/gal-and-gali-original-image.jpg",
      output: "/cartoon-output-image-3.png",
      inputAlt: "Original women and baby photo",
      outputAlt: "Cartoon style result for women and baby",
    },
  ],
  pencil: [
    {
      input: "/gal-and-gali-original-image.jpg",
      output: "/pencils-output-image-1.png",
      inputAlt: "Original women and baby photo",
      outputAlt: "Pencil style result for women and baby",
    },
    {
      input: "/islam-and-gali-original-image.jpg",
      output: "/pencils-output-image-2.png",
      inputAlt: "Original family photo",
      outputAlt: "Pencil style result",
    },
    {
      input: "/karen-yael-roni-original-image.jpg",
      output: "/pencils-output-image-3.png",
      inputAlt: "Original friends photo",
      outputAlt: "Pencil style result for friends",
    },
  ],
  watercolor: [
    {
      input: "/maya-original-image.jpg",
      output: "/watercolor-output-image-1.png",
      inputAlt: "Original little gali photo",
      outputAlt: "Watercolor style result for little girl",
    },
    {
      input: "/gal-and-gali-original-image.jpg",
      output: "/watercolor-output-image-2.png",
      inputAlt: "Original women and baby photo",
      outputAlt: "Watercolor style result for women and baby",
    },
    {
      input: "/papi-and-tali-and-gali-original-image.jpg",
      output: "/watercolor-output-image-3.png",
      inputAlt: "Original grandparent and baby photo",
      outputAlt: "Watercolor style result for grandparent and baby",
    },
  ],
};

export function StyleExamplesSection() {
  const { t, locale } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [activeStyle, setActiveStyle] = useState<StyleType>("cartoon");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isChangingStyle, setIsChangingStyle] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<{ input: string; output: string; inputAlt: string; outputAlt: string } | null>(null);

  const styles: { key: StyleType; label: string }[] = [
    { key: "cartoon", label: t("home.styleExamples.cartoon") },
    { key: "pencil", label: t("home.styleExamples.pencil") },
    { key: "watercolor", label: t("home.styleExamples.watercolor") },
  ];

  const currentExamples = styleExamples[activeStyle];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    const handleResize = () => checkMobile();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Preload images for current style - use Next.js Image optimization
  useEffect(() => {
    // Don't mark images as loaded when changing styles
    setIsChangingStyle(true);
    
    const preloadImages = async () => {
      currentExamples.forEach((example) => {
        // Create link elements for preloading with Next.js optimization
        const inputLink = document.createElement('link');
        inputLink.rel = 'preload';
        inputLink.as = 'image';
        inputLink.href = example.input;
        document.head.appendChild(inputLink);

        const outputLink = document.createElement('link');
        outputLink.rel = 'preload';
        outputLink.as = 'image';
        outputLink.href = example.output;
        document.head.appendChild(outputLink);
      });
    };

    preloadImages();
    
    // Allow skeleton to show briefly
    setTimeout(() => {
      setIsChangingStyle(false);
    }, 100);
  }, [currentExamples]);

  // Reset to first slide when changing styles
  useEffect(() => {
    setCurrentIndex(0);
    if (swiperInstance) {
      swiperInstance.slideToLoop(0, 0); // 0ms transition for instant reset
    }
  }, [activeStyle, swiperInstance]);

  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => new Set(prev).add(src));
  };

  const openModal = (example: StyleExample) => {
    setModalImages(example);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setModalImages(null), 300); // Wait for animation to finish
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalOpen) {
        closeModal();
      }
    };
    
    if (modalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  return (
    <motion.section
      aria-label={t("home.styleExamples.ariaLabel")}
      className="relative bg-[#F9F7EE] pb-16 lg:pb-24"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: easeOwlet }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          className="text-center mb-8 lg:mb-12 pt-8 lg:pt-10"
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
          <Title
            as="h2"
            highlightText={t("home.styleExamples.titleHighlight")}
            size="lg"
            className="mb-4"
          >
            {t("home.styleExamples.title")}
          </Title>
          <motion.p
            className={`text-base lg:text-lg font-body text-medium-gray max-w-3xl mx-auto ${
              locale === "en" ? "text-center" : "text-center"
            }`}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            {t("home.styleExamples.subtitle")}
          </motion.p>
        </motion.div>

        {/* Style Tabs - Single row on mobile */}
        <div className="flex flex-row justify-center items-center gap-2 sm:gap-3 mb-8 lg:mb-12">
          {styles.map((style) => (
            <motion.button
              key={style.key}
              onClick={() => setActiveStyle(style.key)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-body-bold text-xs sm:text-sm lg:text-base transition-all duration-300 min-w-[90px] sm:min-w-[140px] cursor-pointer ${
                activeStyle === style.key
                  ? "bg-primary-orange text-white shadow-lg"
                  : "bg-white text-dark-gray hover:bg-gray-50 border-2 border-gray-200"
              }`}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : { scale: 1.05, transition: { duration: 0.2 } }
              }
              whileTap={
                prefersReducedMotion ? undefined : { scale: 0.98 }
              }
            >
              {style.label}
            </motion.button>
          ))}
        </div>

        {/* Examples */}
        <div className="max-w-5xl mx-auto mb-6 lg:mb-8">
          {/* Mobile: Carousel with Swiper */}
          {isMobile !== false && (
            <motion.div
              key={activeStyle}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              transition={{ duration: 0.3, ease: easeOwlet }}
              className="md:hidden"
            >
              <Swiper
                slidesPerView={1}
                // spaceBetween={16}
                // centeredSlides={true}
                loop={true}
                // navigation
                // loopAdditionalSlides={2}
                onSwiper={setSwiperInstance}
                onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
                // pagination={{
                //   clickable: true,
                // }}
                // dir={locale === "he" ? "rtl" : "ltr"}
                // className="pb-2"
              >
                  {currentExamples.map((example, index) => (
                    <SwiperSlide key={`${activeStyle}-mobile-${index}`}>
                      <div 
                        className="bg-white rounded-2xl p-4 shadow-md mx-2 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => openModal(example)}
                      >
                        <div className="grid grid-cols-2 gap-3">
                        {/* Before */}
                        <div>
                          <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-200">
                            {(!loadedImages.has(example.input) || isChangingStyle) && <ImageSkeleton />}
                            <Image
                              src={example.input}
                              alt={example.inputAlt}
                              fill
                              priority={index === 0}
                              quality={85}
                              className={`object-cover transition-opacity duration-300 ${
                                loadedImages.has(example.input) && !isChangingStyle ? "opacity-100" : "opacity-0"
                              }`}
                              sizes="(max-width: 768px) 40vw, 20vw"
                              onLoad={() => handleImageLoad(example.input)}
                            />
                          </div>
                          <p className="text-xs font-body text-medium-gray text-center">
                            {t("home.styleExamples.before")}
                          </p>
                        </div>

                        {/* After */}
                        <div>
                          <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-200">
                            {(!loadedImages.has(example.output) || isChangingStyle) && <ImageSkeleton />}
                            <Image
                              src={example.output}
                              alt={example.outputAlt}
                              fill
                              priority={index === 0}
                              quality={85}
                              className={`object-cover transition-opacity duration-300 ${
                                loadedImages.has(example.output) && !isChangingStyle ? "opacity-100" : "opacity-0"
                              }`}
                              sizes="(max-width: 768px) 40vw, 20vw"
                              onLoad={() => handleImageLoad(example.output)}
                            />
                          </div>
                          <p className="text-xs font-body text-medium-gray text-center">
                            {t("home.styleExamples.after")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Dot indicators */}
              <div className="flex justify-center gap-2 mt-4" style={{ direction: "ltr" }}>
                {currentExamples.map((_, index) => {
                  const visualIndex = locale === "he" ? currentExamples.length - 1 - index : index;
                  return (
                    <motion.button
                      key={index}
                      onClick={() => {
                        if (swiperInstance) {
                          swiperInstance.slideToLoop(visualIndex);
                        }
                      }}
                      className="block shrink-0 h-2 rounded-full cursor-pointer hover:opacity-70"
                      variants={dotVariants}
                      animate={currentIndex === visualIndex ? "active" : "inactive"}
                      style={{
                        backgroundColor: currentIndex === visualIndex ? "#693430" : "#9ca3af",
                      }}
                      aria-label={`Example ${visualIndex + 1}`}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Desktop: 3 in a row */}
          {isMobile !== true && (
            <motion.div
              key={activeStyle}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              transition={{ duration: 0.3, ease: easeOwlet }}
              className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto"
            >
              {currentExamples.map((example, index) => (
                <motion.div
                  key={`${activeStyle}-desktop-${index}`}
                  className="bg-white rounded-2xl p-4 lg:p-5 shadow-md cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => openModal(example)}
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }
                  }
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { opacity: 1, scale: 1 }
                  }
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: easeOwlet,
                  }}
                  whileHover={
                    prefersReducedMotion ? undefined : { scale: 1.02 }
                  }
                >
                  {/* Before/After Images */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Before */}
                    <div>
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-200">
                        {(!loadedImages.has(example.input) || isChangingStyle) && <ImageSkeleton />}
                        <Image
                          src={example.input}
                          alt={example.inputAlt}
                          fill
                          priority
                          quality={85}
                          className={`object-cover transition-opacity duration-300 ${
                            loadedImages.has(example.input) && !isChangingStyle ? "opacity-100" : "opacity-0"
                          }`}
                          sizes="(max-width: 1024px) 25vw, 15vw"
                          onLoad={() => handleImageLoad(example.input)}
                        />
                      </div>
                      <p className="text-xs lg:text-sm font-body text-medium-gray text-center">
                        {t("home.styleExamples.before")}
                      </p>
                    </div>

                    {/* After */}
                    <div>
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-200">
                        {(!loadedImages.has(example.output) || isChangingStyle) && <ImageSkeleton />}
                        <Image
                          src={example.output}
                          alt={example.outputAlt}
                          fill
                          priority
                          quality={85}
                          className={`object-cover transition-opacity duration-300 ${
                            loadedImages.has(example.output) && !isChangingStyle ? "opacity-100" : "opacity-0"
                          }`}
                          sizes="(max-width: 1024px) 25vw, 15vw"
                          onLoad={() => handleImageLoad(example.output)}
                        />
                      </div>
                      <p className="text-xs lg:text-sm font-body text-medium-gray text-center">
                        {t("home.styleExamples.after")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Modal */}
        {modalOpen && modalImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOwlet }}
              className="relative bg-white rounded-2xl p-4 sm:p-6 max-w-2xl lg:max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-dark-gray"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Modal Content - Mobile: smaller images */}
              <div className="mt-12 sm:mt-14 md:mt-16">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3 max-w-[256px] mx-auto">
                  {/* Original (smaller) */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-2/5 aspect-square rounded-lg overflow-hidden mb-2 bg-gray-200">
                      <Image
                        src={modalImages.input}
                        alt={modalImages.inputAlt}
                        fill
                        className="object-cover"
                        sizes="32vw"
                        quality={90}
                      />
                    </div>
                    <p className="text-xs font-body-bold text-medium-gray">
                      {t("home.styleExamples.before")}
                    </p>
                  </div>

                  {/* Output (also smaller now) */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2 bg-gray-200">
                      <Image
                        src={modalImages.output}
                        alt={modalImages.outputAlt}
                        fill
                        className="object-cover"
                        sizes="64vw"
                        quality={90}
                      />
                    </div>
                    <p className="text-sm font-body-bold text-dark-gray">
                      {t("home.styleExamples.after")}
                    </p>
                  </div>
                </div>

                {/* Desktop Layout - Equal sizes */}
                <div className="hidden md:grid md:grid-cols-2 gap-4 lg:gap-6">
                  {/* Before */}
                  <div>
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-200">
                      <Image
                        src={modalImages.input}
                        alt={modalImages.inputAlt}
                        fill
                        className="object-cover"
                        sizes="40vw"
                        quality={90}
                      />
                    </div>
                    <p className="text-sm font-body-bold text-medium-gray text-center">
                      {t("home.styleExamples.before")}
                    </p>
                  </div>

                  {/* After */}
                  <div>
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-200">
                      <Image
                        src={modalImages.output}
                        alt={modalImages.outputAlt}
                        fill
                        className="object-cover"
                        sizes="40vw"
                        quality={90}
                      />
                    </div>
                    <p className="text-sm font-body-bold text-dark-gray text-center">
                      {t("home.styleExamples.after")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

