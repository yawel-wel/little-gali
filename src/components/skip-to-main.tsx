"use client";

import { useLanguage } from "@/lib/LanguageContext";

export function SkipToMain() {
  const { t } = useLanguage();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary-orange focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:font-body-bold"
    >
      {t("accessibility.skipToMain")}
    </a>
  );
}
