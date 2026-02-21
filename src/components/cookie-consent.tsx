"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MuiButton from "@mui/material/Button";
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

  const handleAccept = () => {
    localStorage.setItem(CONSENT_COOKIE_NAME, "accepted");
    setShowBanner(false);
    loadTrackingScripts();
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_COOKIE_NAME, "declined");
    setShowBanner(false);
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
            <div className="flex flex-col gap-3">
              {/* Text Content */}
              <div className="text-center md:text-right">
                <p className="font-body text-dark-gray text-sm leading-relaxed">
                  {t("cookieConsent.description")}
                  {" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-orange hover:underline font-body-bold whitespace-nowrap"
                  >
                    {t("cookieConsent.learnMore")}
                  </Link>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-center md:justify-end">
                <MuiButton
                  variant="contained"
                  onClick={handleAccept}
                  size="small"
                  sx={{
                    px: 2.5,
                    py: 0.75,
                    fontFamily: "var(--font-assistant)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textTransform: "none",
                    backgroundColor: "#e1b093",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#B89275",
                    },
                  }}
                >
                  {t("cookieConsent.accept")}
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  onClick={handleDecline}
                  size="small"
                  sx={{
                    px: 2.5,
                    py: 0.75,
                    fontFamily: "var(--font-assistant)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    textTransform: "none",
                    borderColor: "#e1b093",
                    color: "#e1b093",
                    "&:hover": {
                      borderColor: "#B89275",
                      backgroundColor: "rgba(225, 176, 147, 0.04)",
                    },
                  }}
                >
                  {t("cookieConsent.decline")}
                </MuiButton>
              </div>
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
