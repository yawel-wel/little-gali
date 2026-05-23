"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Image from "next/image";

export type StyleType = "cartoon" | "pencil" | "watercolor";

interface StyleSelectorProps {
  selectedStyle: StyleType;
  onStyleChange: (style: StyleType) => void;
}

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

export function StyleSelector({
  selectedStyle,
  onStyleChange,
}: StyleSelectorProps) {
  const { t, locale } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
  const [isChangingStyle, setIsChangingStyle] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const currentOutputImages = outputImages[selectedStyle];

  // Handle style change with animation
  const handleStyleChange = (newStyle: StyleType) => {
    if (newStyle !== selectedStyle) {
      setIsChangingStyle(true);
      // Clear loaded images to show skeleton loaders
      setLoadedImages(new Set());
      onStyleChange(newStyle);
      // Reset after a short delay
      setTimeout(() => {
        setIsChangingStyle(false);
      }, 150);
    }
  };

  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => new Set(prev).add(src));
  };

  const openModal = (index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalImageIndex(null), 300);
  };

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
      <div className="flex flex-col gap-5 w-full">
        {/* Heading and Subtitle Group */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-body-bold text-dark-gray flex items-center justify-center gap-2">
            <span 
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs text-white font-body-bold"
              style={{ backgroundColor: "#e1b093" }}
            >
              2
            </span>
            {locale === "he" ? "בחירת סגנון צבעוני" : "Choose Color Style"}
          </h3>

          {/* Subtitle */}
          <p className="text-md font-body text-medium-gray text-center">
            {t("styleSelector.subtitle")}
          </p>
        </div>

        {/* Style Options */}
        <div className="mx-auto flex w-full max-w-2xl flex-row items-stretch justify-center gap-1.5 px-2 sm:gap-4 sm:px-0">
          {/* Pencil Option */}
          <button
            onClick={() => handleStyleChange("pencil")}
            className={`flex flex-col items-center gap-2 sm:gap-4 p-2.5 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer flex-1 max-w-[140px] sm:max-w-[240px] bg-white ${
              selectedStyle === "pencil"
                ? "border-[4px] border-primary-orange"
                : "border-[2px] border-gray-300 hover:border-gray-400 hover:shadow-md"
            }`}
            style={{
              transform: "scale(1)",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              if (selectedStyle !== "pencil") {
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            {/* Pencil Example Image */}
            <div className="w-[85px] h-[85px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] rounded-lg overflow-hidden bg-white">
              <img
                src="/style-example-pencil.png"
                alt={t("styleSelector.pencilAlt")}
                className="w-full h-full object-cover"
                style={{ border: "none", outline: "none" }}
                onError={(e) => {
                  console.error("Failed to load pencil style image");
                  // Try fallback image
                  if (e.currentTarget.src !== "/style-example-pencil2.png") {
                    e.currentTarget.src = "/style-example-pencil2.png";
                  } else {
                    e.currentTarget.style.display = "none";
                  }
                }}
              />
            </div>
            {/* Label */}
            <span className="font-body-bold text-sm sm:text-base md:text-lg text-dark-gray">
              {t("styleSelector.pencil")}
            </span>
            {/* Description */}
            <span className="font-body text-xs sm:text-sm text-medium-gray text-center px-2 -mt-2">
              {t("styleSelector.pencilDescription")}
            </span>
          </button>

          {/* Cartoon Option */}
          <button
            onClick={() => handleStyleChange("cartoon")}
            className={`flex flex-col items-center gap-2 sm:gap-4 p-2.5 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer flex-1 max-w-[140px] sm:max-w-[240px] bg-white ${
              selectedStyle === "cartoon"
                ? "border-[4px] border-primary-orange"
                : "border-[2px] border-gray-300 hover:border-gray-400 hover:shadow-md"
            }`}
            style={{
              transform: "scale(1)",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              if (selectedStyle !== "cartoon") {
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            {/* Cartoon Example Image */}
            <div className="w-[85px] h-[85px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] rounded-lg overflow-hidden bg-white">
              <img
                src="/style-example-cartoon.png"
                alt={t("styleSelector.cartoonAlt")}
                className="w-full h-full object-cover"
                style={{ border: "none", outline: "none" }}
                onError={(e) => {
                  console.error("Failed to load cartoon style image");
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            {/* Label */}
            <span className="font-body-bold text-sm sm:text-base md:text-lg text-dark-gray">
              {t("styleSelector.cartoon")}
            </span>
            {/* Description */}
            <span className="font-body text-xs sm:text-sm text-medium-gray text-center px-2 -mt-2">
              {t("styleSelector.cartoonDescription")}
            </span>
          </button>

          {/* Watercolor Option */}
          <button
            onClick={() => handleStyleChange("watercolor")}
            className={`flex flex-col items-center gap-2 sm:gap-4 p-2.5 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer flex-1 max-w-[140px] sm:max-w-[240px] bg-white ${
              selectedStyle === "watercolor"
                ? "border-[4px] border-primary-orange"
                : "border-[2px] border-gray-300 hover:border-gray-400 hover:shadow-md"
            }`}
            style={{
              transform: "scale(1)",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              if (selectedStyle !== "watercolor") {
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            {/* Watercolor Example Image */}
            <div className="w-[85px] h-[85px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] rounded-lg overflow-hidden bg-white">
              <img
                src="/style-example-watercolor.png"
                alt={t("styleSelector.watercolorAlt")}
                className="w-full h-full object-cover"
                style={{ border: "none", outline: "none" }}
                onError={(e) => {
                  console.error("Failed to load watercolor style image");
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            {/* Label */}
            <span className="font-body-bold text-sm sm:text-base md:text-lg text-dark-gray">
              {t("styleSelector.watercolor")}
            </span>
            {/* Description */}
            <span className="font-body text-xs sm:text-sm text-medium-gray text-center px-2 -mt-2">
              {t("styleSelector.watercolorDescription")}
            </span>
          </button>
        </div>

        {/* Style Examples Title */}
        <div className="w-full text-center mt-2">
          <h4 className="text-sm sm:text-base font-body-bold text-dark-gray">
            {locale === "he" ? "דוגמאות לסגנון" : "Style Examples"}
          </h4>
        </div>

        {/* Scrollable Thumbnail Gallery with Animation */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-x-auto md:overflow-x-visible overflow-y-hidden -mt-2">
          <div className="flex justify-center w-full">
            <div className="flex gap-2 sm:gap-3 md:gap-3 lg:gap-4 pb-2 px-4">
              {currentOutputImages.map((outputImg, index) => (
                <button
                  key={`${selectedStyle}-${index}`}
                  onClick={() => openModal(index)}
                  className="relative flex-shrink-0 w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px] rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-300 hover:border-primary-orange"
                >
                  {/* Skeleton Loader - shown when changing style or image not loaded */}
                  {!loadedImages.has(outputImg.src) && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse z-10">
                      <div 
                        className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                        style={{
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s ease-in-out infinite'
                        }}
                      />
                    </div>
                  )}
                  <img
                    src={outputImg.src}
                    alt={outputImg.alt}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{
                      opacity: loadedImages.has(outputImg.src) ? 1 : 0
                    }}
                    loading="lazy"
                    onLoad={() => handleImageLoad(outputImg.src)}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal - Mobile Layout (input small, output big) */}
      {isModalOpen && modalImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-dark-gray" />
            </button>

            {/* Modal Content - Mobile Style Layout */}
            <div className="mt-8 sm:mt-10 space-y-3 max-w-[280px] mx-auto">
              <div className="flex flex-col items-center">
                <p className="text-sm font-body-bold text-medium-gray mb-2">
                  {t("home.styleExamples.before")}
                </p>
                <div className="relative w-2/5 aspect-square rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={originalImages[modalImageIndex].src}
                    alt={originalImages[modalImageIndex].alt}
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
                    src={currentOutputImages[modalImageIndex].src}
                    alt={currentOutputImages[modalImageIndex].alt}
                    fill
                    className="object-cover"
                    sizes="64vw"
                    quality={90}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
