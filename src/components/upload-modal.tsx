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
      "/too-close-example.jpg",
      "/group-example.jpeg",
      "/good-example-1.jpg",
      "/good-example-2.jpg",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-[680px] w-full max-h-[90vh] overflow-hidden mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${
            locale === "en" ? "right-4" : "left-4"
          } w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all cursor-pointer`}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Modal Content */}
        <div className="px-8 py-6">
          {/* Title */}
          <h2 className="text-xl font-semibold text-dark-gray mb-6 text-center">
            {t("uploadModal.title")}
          </h2>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-x-12 items-start mt-4 mb-6">
            {/* Left Column - What to Choose */}
            <div className="pt-1">
              <h3
                className={`text-md font-semibold text-dark-gray mb-2 ${
                  locale === "en" ? "text-left" : "text-right"
                }`}
              >
                {t("uploadModal.choose")}
              </h3>
              <ul className="space-y-2 w-full">
                <li
                  className={`flex items-center gap-2 ${
                    locale === "en" ? "flex-row justify-start" : "flex-row"
                  }`}
                >
                  <span className="text-[14px] md:text-[18px] leading-none flex-shrink-0">
                    ✅
                  </span>
                  <p
                    className={`text-dark-gray font-body text-base leading-6 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("uploadModal.clearFaces")}
                  </p>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    locale === "en" ? "flex-row justify-start" : "flex-row"
                  }`}
                >
                  <span className="text-[14px] md:text-[18px] leading-none flex-shrink-0">
                    ✅
                  </span>
                  <p
                    className={`text-dark-gray font-body text-base leading-6 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("uploadModal.visibleEyes")}
                  </p>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    locale === "en" ? "flex-row justify-start" : "flex-row"
                  }`}
                >
                  <span className="text-[14px] md:text-[18px] leading-none flex-shrink-0">
                    ✅
                  </span>
                  <p
                    className={`text-dark-gray font-body text-base leading-6 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("uploadModal.goodLighting")}
                  </p>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    locale === "en" ? "flex-row justify-start" : "flex-row"
                  }`}
                >
                  <span className="text-[14px] md:text-[18px] leading-none flex-shrink-0">
                    ✅
                  </span>
                  <p
                    className={`text-dark-gray font-body text-base leading-6 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("uploadModal.oneOrTwo")}
                  </p>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    locale === "en" ? "flex-row justify-start" : "flex-row"
                  }`}
                >
                  <span className="text-[14px] md:text-[18px] leading-none flex-shrink-0">
                    ✅
                  </span>
                  <p
                    className={`text-dark-gray font-body text-base leading-6 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("uploadModal.naturalSmile")}
                  </p>
                </li>
              </ul>
            </div>

            {/* Right Column - What to Avoid */}
            <div>
              <h3
                className={`text-md font-semibold text-dark-gray mb-2 ${
                  locale === "en" ? "text-left" : "text-right"
                }`}
              >
                {t("uploadModal.avoid")}
              </h3>
              <ul className="space-y-2 w-full">
                <li
                  className={`flex items-center gap-2 ${
                    locale === "en" ? "flex-row justify-start" : "flex-row"
                  }`}
                >
                  <span className="text-[14px] md:text-[18px] leading-none flex-shrink-0">
                    🚫
                  </span>
                  <p
                    className={`text-dark-gray font-body text-base leading-5 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("uploadModal.noBWFilter")}
                  </p>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    locale === "en" ? "flex-row justify-start" : "flex-row"
                  }`}
                >
                  <span className="text-[14px] md:text-[18px] leading-none flex-shrink-0">
                    🚫
                  </span>
                  <p
                    className={`text-dark-gray font-body text-base leading-5 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("uploadModal.notTooClose")}
                  </p>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    locale === "en" ? "flex-row justify-start" : "flex-row"
                  }`}
                >
                  <span className="text-[14px] md:text-[18px] leading-none flex-shrink-0">
                    🚫
                  </span>
                  <p
                    className={`text-dark-gray font-body text-base leading-5 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("uploadModal.notBlurry")}
                  </p>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    locale === "en" ? "flex-row justify-start" : "flex-row"
                  }`}
                >
                  <span className="text-[14px] md:text-[18px] leading-none flex-shrink-0">
                    🚫
                  </span>
                  <p
                    className={`text-dark-gray font-body text-base leading-5 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("uploadModal.noGroup")}
                  </p>
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    locale === "en" ? "flex-row justify-start" : "flex-row"
                  }`}
                >
                  <span className="text-[14px] md:text-[18px] leading-none flex-shrink-0">
                    🚫
                  </span>
                  <p
                    className={`text-dark-gray font-body text-base leading-5 ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("uploadModal.noSunglasses")}
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-5 mb-5 flex justify-center">
            <div
              className={`bg-[#FFF8E6] text-gray-700 text-sm rounded-lg px-3 py-2 ${
                locale === "en" ? "pl-4" : "pr-4"
              } inline-flex items-start gap-2`}
            >
              <span className="text-yellow-500 text-lg leading-none">💡</span>
              <span>
                <strong>{t("uploadModal.important")}</strong>{" "}
                {t("uploadModal.importantNote")}
              </span>
            </div>
          </div>

          {/* Image Examples - Mixed (2 X + 2 Check) */}
          <div className="flex items-center justify-center gap-3 mt-6 mb-2">
            {/* Red X 1 - Too Close */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/too-close-example.jpg"
                  alt={t("uploadModal.tooCloseExample")}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                <X className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Red X 2 - Group */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/group-example.jpeg"
                  alt={t("uploadModal.groupExample")}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                <X className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Green Check 1 */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/good-example-1.jpg"
                  alt={t("uploadModal.goodExample1")}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Green Check 2 */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/good-example-2.jpg"
                  alt={t("uploadModal.goodExample2")}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* CTA Button */}
          {showUploadButton && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  height: 44,
                  px: 3,
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
                  className="w-5 h-5"
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
          <div className="text-center mt-2 mb-2">
            <p className="font-body text-sm text-gray-500 text-center">
              {t("uploadModal.privacy")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
