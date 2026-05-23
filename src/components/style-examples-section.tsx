"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { motion } from "framer-motion";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

import "swiper/css";
import "swiper/css/free-mode";

const easeOwlet = [0.16, 1, 0.3, 1] as const;

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

// Original images (shared across all styles - stay the same)
const originalImages = [
  { src: "/original-image-1.jpg", alt: "Original photo 1" },
  { src: "/original-image-2.jpg", alt: "Original photo 2" },
  { src: "/original-image-3.jpg", alt: "Original photo 3" },
  { src: "/original-image-4.jpg", alt: "Original photo 4" },
  { src: "/original-image-5.jpg", alt: "Original photo 5" },
  { src: "/original-image-6.jpg", alt: "Original photo 6" },
  { src: "/original-image-7.jpg", alt: "Original photo 7" },
];

// Output images (per style - these change when style changes)
const outputImages: Record<StyleType, Array<{ src: string; alt: string }>> = {
  cartoon: [
    { src: "/cartoon-output-image-1.png", alt: "Cartoon style result" },
    { src: "/cartoon-output-image-2.png", alt: "Cartoon style result" },
    { src: "/cartoon-output-image-3.png", alt: "Cartoon style result" },
    { src: "/cartoon-output-image-4.png", alt: "Cartoon style result" },
    { src: "/cartoon-output-image-5.png", alt: "Cartoon style result" },
    { src: "/cartoon-output-image-6.png", alt: "Cartoon style result" },
    { src: "/cartoon-output-image-7.png", alt: "Cartoon style result" },
  ],
  pencil: [
    { src: "/pencils-output-image-1.png", alt: "Pencil style result" },
    { src: "/pencils-output-image-2.png", alt: "Pencil style result" },
    { src: "/pencils-output-image-3.png", alt: "Pencil style result" },
    { src: "/pencils-output-image-4.png", alt: "Pencil style result" },
    { src: "/pencils-output-image-5.png", alt: "Pencil style result" },
    { src: "/pencils-output-image-6.png", alt: "Pencil style result" },
    { src: "/pencils-output-image-7.png", alt: "Pencil style result" },
  ],
  watercolor: [
    { src: "/watercolor-output-image-1.png", alt: "Watercolor style result" },
    { src: "/watercolor-output-image-2.png", alt: "Watercolor style result" },
    { src: "/watercolor-output-image-3.png", alt: "Watercolor style result" },
    { src: "/watercolor-output-image-4.png", alt: "Watercolor style result" },
    { src: "/watercolor-output-image-5.png", alt: "Watercolor style result" },
    { src: "/watercolor-output-image-6.png", alt: "Watercolor style result" },
    { src: "/watercolor-output-image-7.png", alt: "Watercolor style result" },
  ],
};

export function StyleExamplesSection() {
  const { t, locale } = useLanguage();
  const [activeStyle, setActiveStyle] = useState<StyleType>("pencil");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [loadedOutputImages, setLoadedOutputImages] = useState<Set<string>>(new Set());
  const [loadedOriginalImages, setLoadedOriginalImages] = useState<Set<string>>(new Set());
  const [isChangingStyle, setIsChangingStyle] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<{ input: string; output: string; inputAlt: string; outputAlt: string } | null>(null);

  const styles: { key: StyleType; label: string }[] = [
    { key: "pencil", label: t("home.styleExamples.pencil") },
    { key: "watercolor", label: t("home.styleExamples.watercolor") },
    { key: "cartoon", label: t("home.styleExamples.cartoon") },
  ];

  const currentOutputImages = outputImages[activeStyle];

  // Preload original images once on mount
  useEffect(() => {
    originalImages.forEach((img) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    });
  }, []);

  // Preload output images when style changes
  useEffect(() => {
    setIsChangingStyle(true);
    
    currentOutputImages.forEach((img) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    });
    
    setTimeout(() => {
      setIsChangingStyle(false);
    }, 100);
  }, [currentOutputImages]);

  const handleOutputImageLoad = (src: string) => {
    setLoadedOutputImages((prev) => new Set(prev).add(src));
  };

  const handleOriginalImageLoad = (src: string) => {
    setLoadedOriginalImages((prev) => new Set(prev).add(src));
  };

  const openModal = (index: number) => {
    setModalImages({
      input: originalImages[index].src,
      output: currentOutputImages[index].src,
      inputAlt: originalImages[index].alt,
      outputAlt: currentOutputImages[index].alt,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setModalImages(null), 300);
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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const reveal = useScrollReveal(easeOwlet);

  return (
    <motion.section
      aria-label={t("home.styleExamples.ariaLabel")}
      className="relative bg-[#F9F7EE] pb-16 lg:pb-24"
      {...reveal.section}
      transition={{ duration: 0.9, ease: easeOwlet }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-8 lg:mb-12 pt-8 lg:pt-10">
          <Title
            as="h2"
            highlightText={t("home.styleExamples.titleHighlight")}
            size="lg"
            className="mb-4"
          >
            {t("home.styleExamples.title")}
          </Title>
          <p className="text-base lg:text-lg font-body text-medium-gray max-w-3xl mx-auto">
            {t("home.styleExamples.subtitle")}
          </p>
        </div>

        {/* Style Tabs */}
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
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              {style.label}
            </motion.button>
          ))}
        </div>

        {/* Carousel with Overlapping Images */}
        <div className="w-full mb-6">
          <div className="w-full max-w-5xl mx-auto px-4">
            <Swiper
              slidesPerView={2}
              spaceBetween={16}
              loop={true}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
              dir={locale === "he" ? "rtl" : "ltr"}
              breakpoints={{
                768: {
                  slidesPerView: 4,
                  spaceBetween: 24,
                },
              }}
            >
            {originalImages.map((originalImg, index) => {
              const outputImg = currentOutputImages[index];
              return (
                <SwiperSlide key={index}>
                  <div
                    className="relative cursor-pointer group flex flex-col gap-3"
                    onClick={() => openModal(index)}
                  >
                    {/* Original image (top) - smaller */}
                    <div className="w-1/2 aspect-square mx-auto">
                      <div className="relative w-full h-full rounded-lg overflow-hidden bg-white shadow-md border-2 border-white">
                        <Image
                          src={originalImg.src}
                          alt={originalImg.alt}
                          fill
                          priority={index < 4}
                          quality={85}
                          className="object-cover transition-all duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 22vw, 10vw"
                          onLoad={() => handleOriginalImageLoad(originalImg.src)}
                        />
                      </div>
                    </div>

                    {/* Output image (bottom) - full size */}
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-200">
                      {(!loadedOutputImages.has(outputImg.src) || isChangingStyle) && <ImageSkeleton />}
                      <Image
                        src={outputImg.src}
                        alt={outputImg.alt}
                        fill
                        priority={index < 4}
                        quality={85}
                        className={`object-cover transition-all duration-300 ${
                          loadedOutputImages.has(outputImg.src) && !isChangingStyle ? "opacity-100" : "opacity-0"
                        } group-hover:scale-105`}
                        sizes="(max-width: 768px) 45vw, 20vw"
                        onLoad={() => handleOutputImageLoad(outputImg.src)}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-6" style={{ direction: "ltr" }}>
            {originalImages.map((_, index) => {
              const visualIndex = locale === "he" ? originalImages.length - 1 - index : index;
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

              {/* Modal Content */}
              <div className="mt-12 sm:mt-14 md:mt-16">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3 max-w-[256px] mx-auto">
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-body-bold text-medium-gray mb-2">
                      {t("home.styleExamples.before")}
                    </p>
                    <div className="relative w-2/5 aspect-square rounded-lg overflow-hidden bg-gray-200">
                      <Image
                        src={modalImages.input}
                        alt={modalImages.inputAlt}
                        fill
                        className="object-cover"
                        sizes="32vw"
                        quality={90}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <p className="text-sm font-body-bold text-dark-gray mb-2">
                      {t("home.styleExamples.after")}
                    </p>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-200">
                      <Image
                        src={modalImages.output}
                        alt={modalImages.outputAlt}
                        fill
                        className="object-cover"
                        sizes="64vw"
                        quality={90}
                      />
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-2 gap-4 lg:gap-6">
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
