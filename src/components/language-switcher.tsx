"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect, useRef } from "react";

export function LanguageSwitcher({ 
  variant = "desktop",
  onLanguageChange 
}: { 
  variant?: "desktop" | "mobile";
  onLanguageChange?: () => void;
}) {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isRTL, setIsRTL] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsRTL(locale === "he");
  }, [locale]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (newLocale: "he" | "en") => {
    setLocale(newLocale);
    setIsOpen(false);
    onLanguageChange?.();
  };

  if (variant === "mobile") {
    // Dropdown style for side menu
    const currentLanguage = locale === "he" ? "עברית" : "English";
    
    return (
      <div className="relative w-fit" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-4 py-2.5 bg-gray-100 rounded-lg text-dark-gray hover:bg-gray-200 transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          <span className="text-sm font-body">{currentLanguage}</span>
          <ChevronDown 
            className={`h-4 w-4 text-dark-gray transition-transform duration-200 ml-2 ${
              isOpen ? "transform rotate-180" : ""
            }`} 
          />
        </button>
        <div
          className={`absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 z-50 min-w-[120px] ${
            isRTL ? "right-0" : "left-0"
          } ${
            isOpen
              ? "opacity-100 visible pointer-events-auto"
              : "opacity-0 invisible pointer-events-none"
          }`}
        >
          <div className="py-1">
            <button
              onClick={() => handleLanguageChange("he")}
              className={`w-full px-4 py-2 text-sm font-body transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                isRTL ? "text-right" : "text-left"
              } ${
                locale === "he"
                  ? "bg-primary-orange text-white"
                  : "text-dark-gray hover:bg-gray-100"
              }`}
            >
              עברית
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`w-full px-4 py-2 text-sm font-body transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                isRTL ? "text-right" : "text-left"
              } ${
                locale === "en"
                  ? "bg-primary-orange text-white"
                  : "text-dark-gray hover:bg-gray-100"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop variant - dropdown style

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-dark-gray hover:bg-[#D7D8DA] hover:text-dark-gray cursor-pointer rounded-full transition-all duration-200"
      >
        <Globe className="h-5 w-5" />
        <span className="sr-only">Change language</span>
      </Button>
      <div
        className={`absolute top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 z-50 ${
          isRTL ? "right-0" : "left-0"
        } ${
          isOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="py-1">
          <button
            onClick={() => handleLanguageChange("he")}
            className={`w-full px-4 py-2 text-sm font-body transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
              isRTL ? "text-right" : "text-left"
            } ${
              locale === "he"
                ? "bg-primary-orange text-white"
                : "text-dark-gray hover:bg-gray-100"
            }`}
          >
            עברית
          </button>
          <button
            onClick={() => handleLanguageChange("en")}
            className={`w-full px-4 py-2 text-sm font-body transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
              isRTL ? "text-right" : "text-left"
            } ${
              locale === "en"
                ? "bg-primary-orange text-white"
                : "text-dark-gray hover:bg-gray-100"
            }`}
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
}

