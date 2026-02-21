"use client";

import { X, Check } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useEffect } from "react";
import Button from "@mui/material/Button";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  showUploadButton?: boolean;
  onUploadClick?: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  showUploadButton = true,
  onUploadClick,
}: UploadModalProps) {
  const { t, locale } = useLanguage();

  // Preload images when modal component mounts (even before it's opened)
  useEffect(() => {
    const modalImages = [
      "/good-example-1.jpg",
      "/good-example-2.jpg",
      "/good-example-3.jpg",
    ];

    // Preload all images immediately
    modalImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 md:p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-[680px] md:max-w-[480px] w-full max-h-[90vh] overflow-y-auto mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-2 md:top-4 ${
            locale === "en" ? "right-2 md:right-4" : "left-2 md:left-4"
          } w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all cursor-pointer`}
        >
          <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
        </button>

        {/* Modal Content */}
        <div className="px-4 py-4 md:px-4 md:py-5">
          {/* Title */}
          <h2 className={`text-lg md:text-xl font-semibold text-dark-gray mb-1.5 md:mb-1.5 text-center ${
            locale === "en" ? "text-left" : "text-center"
          }`}>
            {t("uploadModal.title")}
          </h2>
          
          {/* Subtitle */}
          <p className={`text-sm md:text-base text-dark-gray mb-4 md:mb-4 leading-relaxed ${
            locale === "en" ? "text-left" : "text-center"
          }`}>
            {t("uploadModal.subtitle")}
          </p>

          {/* Single Column List */}
          <div className="max-w-md md:max-w-full mx-auto">
            <ul className="space-y-2 md:space-y-2 w-full">
              <li className={`flex items-center gap-2 md:gap-2 ${
                locale === "en" ? "flex-row" : "flex-row"
              }`}>
                <span className="text-[15px] md:text-[18px] leading-none flex-shrink-0">
                  ✅
                </span>
                <p className={`text-dark-gray font-body text-sm md:text-base leading-5 md:leading-6 flex-1 ${
                  locale === "en" ? "text-left" : "text-right"
                }`}>
                  {t("uploadModal.facingCamera")}
                </p>
              </li>
              <li className={`flex items-center gap-2 md:gap-2 ${
                locale === "en" ? "flex-row" : "flex-row"
              }`}>
                <span className="text-[15px] md:text-[18px] leading-none flex-shrink-0">
                  ✅
                </span>
                <p className={`text-dark-gray font-body text-sm md:text-base leading-5 md:leading-6 flex-1 ${
                  locale === "en" ? "text-left" : "text-right"
                }`}>
                  {t("uploadModal.eyesVisible")}
                </p>
              </li>
              <li className={`flex items-center gap-2 md:gap-2 ${
                locale === "en" ? "flex-row" : "flex-row"
              }`}>
                <span className="text-[15px] md:text-[18px] leading-none flex-shrink-0">
                  ✅
                </span>
                <p className={`text-dark-gray font-body text-sm md:text-base leading-5 md:leading-6 flex-1 ${
                  locale === "en" ? "text-left" : "text-right"
                }`}>
                  {t("uploadModal.facesNotCut")}
                </p>
              </li>
              <li className={`flex items-center gap-2 md:gap-2 ${
                locale === "en" ? "flex-row" : "flex-row"
              }`}>
                <span className="text-[15px] md:text-[18px] leading-none flex-shrink-0">
                  ✅
                </span>
                <p className={`text-dark-gray font-body text-sm md:text-base leading-5 md:leading-6 flex-1 ${
                  locale === "en" ? "text-left" : "text-right"
                }`}>
                  {t("uploadModal.goodLightingClear")}
                </p>
              </li>
            </ul>
          </div>

          {/* Image Examples - Good Examples Only */}
          <div className="flex items-center justify-center gap-2 md:gap-2 mt-4 mb-2 md:mt-4 md:mb-2">
            {/* Green Check 1 */}
            <div className="relative">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/good-example-1.jpg"
                  alt={t("uploadModal.goodExample1")}
                  className="w-full h-full object-cover"
                  style={{ objectFit: 'cover' }}
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
              </div>
            </div>

            {/* Green Check 2 */}
            <div className="relative">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/good-example-2.jpg"
                  alt={t("uploadModal.goodExample2")}
                  className="w-full h-full object-cover"
                  style={{ objectFit: 'cover' }}
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
              </div>
            </div>

            {/* Green Check 3 */}
            <div className="relative">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/good-example-3.jpg"
                  alt="Good Example 3"
                  className="w-full h-full object-cover"
                  style={{ objectFit: 'cover' }}
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
              </div>
            </div>
          </div>

          {/* CTA Button */}
          {showUploadButton && (
            <div className="mt-3 md:mt-3 flex justify-center">
              <Button
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: { xs: "0.875rem", md: "0.95rem" },
                  fontWeight: 500,
                  height: { xs: 40, md: 44 },
                  px: { xs: 2.5, md: 3 },
                  maxWidth: 280,
                  boxShadow: "none",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Close modal first to avoid state update conflicts
                  onClose();
                  // Use requestAnimationFrame to ensure modal closes before opening file dialog
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      onUploadClick?.();
                    });
                  });
                }}
                className="cursor-pointer w-full max-w-[280px] shadow-md flex items-center justify-center gap-2"
              >
                {t("uploadModal.chooseFromDevice")}
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </Button>
            </div>
          )}

          {/* Privacy Statement */}
          <div className="text-center mt-1.5 mb-1 md:mt-1.5 md:mb-1">
            <p className="font-body text-xs md:text-sm text-gray-500 text-center">
              {t("uploadModal.privacy")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
