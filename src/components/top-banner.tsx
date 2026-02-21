"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";

export function TopBanner() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Get messages from translations
  const messages = [
    t("banner.shipping"),
    t("banner.freeCard")
  ];

  // Rotate messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide banner when scrolling down past 10px, show when at top or scrolling up
      if (currentScrollY > 10 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 10) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Update CSS variable for header positioning based on actual banner height
  useEffect(() => {
    const updateBannerHeight = () => {
      if (bannerRef.current && isVisible) {
        const height = bannerRef.current.offsetHeight;
        document.documentElement.style.setProperty(
          "--banner-height",
          `${height}px`
        );
      } else {
        document.documentElement.style.setProperty(
          "--banner-height",
          "0px"
        );
      }
    };

    updateBannerHeight();
    
    // Update on resize
    window.addEventListener("resize", updateBannerHeight);
    return () => window.removeEventListener("resize", updateBannerHeight);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={bannerRef}
          initial={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 left-0 right-0 z-[60] text-center py-2 px-4"
          style={{ backgroundColor: "#693430" }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              className="text-white font-body text-sm md:text-base"
            >
              {messages[currentMessageIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
