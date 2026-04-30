"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

const CONSENT_COOKIE_NAME = "little-gali-cookie-consent";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const { t, locale } = useLanguage();

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(CONSENT_COOKIE_NAME);
    
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    } else if (consent === "accepted") {
      // Load tracking scripts if previously accepted
      loadTrackingScripts();
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(CONSENT_COOKIE_NAME, "accepted");
    setShowBanner(false);
    loadTrackingScripts();
  };

  const loadTrackingScripts = () => {
    // Trigger a custom event that will be listened to by the layout
    window.dispatchEvent(new Event("cookieConsentAccepted"));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-md z-[9999]"
          role="dialog"
          aria-label={t("cookieConsent.ariaLabel")}
          aria-live="polite"
        >
          <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 px-5 py-4">
            <div
              className="flex items-start gap-3"
              dir={locale === "he" ? "rtl" : "ltr"}
            >
              <div className="flex-1 min-w-0 text-center md:text-right">
                <p className="font-body-bold text-dark-gray text-sm leading-relaxed">
                  {t("cookieConsent.line1")}
                </p>
                <p className="font-body-bold text-dark-gray text-sm leading-relaxed mt-1">
                  {t("cookieConsent.line2BeforeLink")}
                  <Link
                    href="/privacy"
                    className="text-dark-gray underline underline-offset-2 decoration-current font-body-bold hover:opacity-80"
                  >
                    {t("cookieConsent.policyLink")}
                  </Link>
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 -mt-0.5 -me-1 p-1.5 rounded-md text-dark-gray cursor-pointer hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-orange"
                aria-label={t("cookieConsent.close")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to check if consent has been given
export function useHasConsent(): boolean {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_COOKIE_NAME);
    setHasConsent(consent === "accepted");

    const handleConsentChange = () => {
      const consent = localStorage.getItem(CONSENT_COOKIE_NAME);
      setHasConsent(consent === "accepted");
    };

    window.addEventListener("cookieConsentAccepted", handleConsentChange);
    return () => {
      window.removeEventListener("cookieConsentAccepted", handleConsentChange);
    };
  }, []);

  return hasConsent;
}
