"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { CartDrawer } from "@/components/cart-drawer";
import { HeaderMenu } from "@/components/header-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SkipToMain } from "@/components/skip-to-main";
import { useLanguage } from "@/lib/LanguageContext";

const easeOwlet: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Orchestrated entrance: the bar glides down (no overshoot, so no gap opens
// above it), then the logo drops in with a gentle spring settle, then the
// side controls fade in. Transforms/opacity only, so it stays smooth on phones.
const headerVariants: Variants = {
  hidden: { y: "-100%" },
  visible: { y: 0, transition: { duration: 0.7, ease: easeOwlet } },
};

const logoVariants: Variants = {
  hidden: { opacity: 0, y: -18, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.9,
      bounce: 0.35,
      delay: 0.25,
      opacity: { duration: 0.35, delay: 0.25, ease: "easeOut" },
    },
  },
};

const sideVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOwlet, delay: 0.45 + i * 0.08 },
  }),
};

export function Header() {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const scrollToHash = (hash: string) => {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isAnchor: boolean,
  ) => {
    if (isAnchor) {
      e.preventDefault();
      const hash = href.substring(1);

      if (pathname !== "/") {
        router.push(href);
        setTimeout(() => scrollToHash(hash), 300);
      } else {
        window.history.pushState(null, "", href);
        scrollToHash(hash);
      }
      return;
    }

    if (href.startsWith("/")) {
      e.preventDefault();
      router.push(href);
    }
  };

  // Navigation items for hamburger menu (mobile and desktop)
  const mobileNavigationItems = [
    { nameKey: "nav.home", href: "/", isAnchor: false },
    { nameKey: "nav.softBook", href: "/soft-book", isAnchor: false },
    { nameKey: "nav.birthPackages", href: "/birth-packages", isAnchor: false },
    { nameKey: "nav.framedArt", href: "/framed-art", isAnchor: false },
    { nameKey: "nav.bambooBlanket", href: "/bamboo-blanket", isAnchor: false },
    { nameKey: "nav.blog", href: "/blog", isAnchor: false },
    { nameKey: "nav.about", href: "/#about", isAnchor: true },
    { nameKey: "nav.giftCard", href: "/#gift-card", isAnchor: true },
    { nameKey: "nav.qa", href: "/qa", isAnchor: false },
    { nameKey: "nav.contact", href: "/contact", isAnchor: false },
  ].map((item) => ({
    ...item,
    name: t(item.nameKey),
    active:
      !item.isAnchor &&
      (item.href === "/blog"
        ? pathname === "/blog" || pathname.startsWith("/blog/")
        : pathname === item.href),
  }));

  return (
    <>
      <SkipToMain />
      <motion.header
        role="banner"
        className="fixed left-0 right-0 z-50 border-0 shadow-none transition-[top] duration-300 ease-in-out"
        style={{
          backgroundColor: "#FAF7F4",
          top: "var(--banner-height, 0px)",
        }}
        variants={headerVariants}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex min-h-[72px] items-center justify-between py-3 md:py-2">
            {/* Left Side - Hamburger Menu (Both languages) */}
            <motion.div
              className="flex-shrink-0 flex items-center gap-4"
              variants={sideVariants}
              custom={0}
            >
              <HeaderMenu
                open={isOpen}
                onOpenChange={setIsOpen}
                items={mobileNavigationItems}
                onItemClick={handleNavClick}
              />
            </motion.div>

            {/* Center - Logo (Perfectly Centered using absolute positioning) */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.a
                href="/"
                className="block"
                aria-label={t("accessibility.homeLink")}
                variants={logoVariants}
              >
                <Image
                  src="/logo.svg"
                  alt="Little Gali"
                  width={1440}
                  height={432}
                  priority
                  className="h-24 w-auto md:h-24 md:w-auto lg:h-30 lg:w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                />
              </motion.a>
            </div>

            {/* Right Side - Cart / Language Switcher (Both languages) */}
            <motion.div
              className="flex items-center gap-4 py-2"
              variants={sideVariants}
              custom={1}
            >
              {/* Mobile Cart Icon */}
              <div className="md:hidden">
                <CartDrawer />
              </div>
              {/* Desktop Cart + Language Switcher */}
              <div className="hidden md:flex items-center gap-4">
                <LanguageSwitcher variant="desktop" />
                <CartDrawer />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>
    </>
  );
}
