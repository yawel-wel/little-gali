"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export type StyleType = "cartoon" | "pencil" | "watercolor";

interface StyleSelectorProps {
  selectedStyle: StyleType;
  onStyleChange: (style: StyleType) => void;
}

export function StyleSelector({
  selectedStyle,
  onStyleChange,
}: StyleSelectorProps) {
  const { t, locale } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center gap-5 w-full">
        {/* Heading and Subtitle Group */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-body-bold text-dark-gray">
              {t("styleSelector.title")}
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
              aria-label="Style information"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-md font-body text-medium-gray text-center">
            {t("styleSelector.subtitle")}
          </p>
        </div>

        {/* Style Options */}
        <div className="flex flex-row gap-1.5 sm:gap-4 justify-center w-full max-w-full sm:max-w-2xl px-2 sm:px-0">
          {/* Cartoon Option */}
          <button
            onClick={() => {
              console.log("🎨 Style changed to: cartoon");
              onStyleChange("cartoon");
            }}
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

          {/* Pencil Option */}
          <button
            onClick={() => {
              console.log("🎨 Style changed to: pencil");
              onStyleChange("pencil");
            }}
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

          {/* Watercolor Option */}
          <button
            onClick={() => {
              console.log("🎨 Style changed to: watercolor");
              onStyleChange("watercolor");
            }}
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
      </div>

      {/* Style Info Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-[900px] w-full max-h-[90vh] overflow-y-auto mx-auto border-2 border-dashed border-gray-300 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "#F3EEE8" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className={`absolute top-3 sm:top-4 ${
                locale === "en" ? "right-3 sm:right-4" : "left-3 sm:left-4"
              } w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all cursor-pointer z-10`}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Modal Content */}
            <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8">
              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-heading text-dark-gray mb-1.5 sm:mb-2 text-center">
                {t("styleSelector.modal.title")}
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base font-body text-medium-gray mb-5 sm:mb-6 text-center">
                {t("styleSelector.modal.subtitle")}
              </p>

              {/* Style Cards */}
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-7 mb-5 sm:mb-6 overflow-x-auto">
                {/* Cartoon Card */}
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-5 md:p-6 bg-white">
                  {/* Icon + Style Name */}
                  <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-body-bold text-dark-gray">
                      {t("styleSelector.cartoon")}
                    </h3>
                  </div>

                  {/* Example Image */}
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="w-full max-w-[160px] sm:max-w-[160px] md:max-w-[180px] h-[160px] sm:h-[160px] md:h-[180px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img
                        src="/style-example-cartoon.png"
                        alt={t("styleSelector.cartoonAlt")}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Description List */}
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.cartoon.bold")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.cartoon.vibrant")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.cartoon.modern")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.cartoon.stylized")}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Pencil Card */}
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-5 md:p-6 bg-white">
                  {/* Icon + Style Name */}
                  <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-body-bold text-dark-gray">
                      {t("styleSelector.pencil")}
                    </h3>
                  </div>

                  {/* Example Image */}
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="w-full max-w-[160px] sm:max-w-[160px] md:max-w-[180px] h-[160px] sm:h-[160px] md:h-[180px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img
                        src="/style-example-pencil.png"
                        alt={t("styleSelector.pencilAlt")}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (
                            e.currentTarget.src !== "/style-example-pencil2.png"
                          ) {
                            e.currentTarget.src = "/style-example-pencil2.png";
                          } else {
                            e.currentTarget.style.display = "none";
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Description List */}
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.pencil.soft")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.pencil.delicate")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.pencil.handDrawn")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.pencil.realistic")}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Watercolor Card */}
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-5 md:p-6 bg-white">
                  {/* Icon + Style Name */}
                  <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-body-bold text-dark-gray">
                      {t("styleSelector.watercolor")}
                    </h3>
                  </div>

                  {/* Example Image */}
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="w-full max-w-[160px] sm:max-w-[160px] md:max-w-[180px] h-[160px] sm:h-[160px] md:h-[180px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img
                        src="/style-example-watercolor.png"
                        alt={t("styleSelector.watercolorAlt")}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Description List */}
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.watercolor.artistic")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.watercolor.colorful")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.watercolor.fluid")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.watercolor.unique")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary-orange text-sm sm:text-base flex-shrink-0">
                        •
                      </span>
                      <span className="text-dark-gray font-body text-sm sm:text-base leading-normal">
                        {t("styleSelector.modal.watercolor.notSuitable")}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Note */}
              <p className="text-xs sm:text-sm font-body text-medium-gray text-center mb-2">
                {t("styleSelector.modal.bottomNote")}
              </p>

              {/* Got it Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-primary-orange hover:bg-primary-orange/90 text-white font-body-bold text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl transition-opacity cursor-pointer"
                >
                  {t("styleSelector.modal.gotIt")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
