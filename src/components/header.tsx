"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { CartDrawer } from "@/components/cart-drawer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SkipToMain } from "@/components/skip-to-main";
import { useLanguage } from "@/lib/LanguageContext";

const easeOwlet = [0.16, 1, 0.3, 1];

export function Header() {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useLanguage();

  const scrollToHash = (hash: string) => {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isAnchor: boolean
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
    { nameKey: "nav.about", href: "/#about", isAnchor: true },
    { nameKey: "nav.giftCard", href: "/#gift-card", isAnchor: true },
    { nameKey: "nav.qa", href: "/qa", isAnchor: false },
    { nameKey: "nav.inspiration", href: "/inspiration", isAnchor: false },
    { nameKey: "nav.contact", href: "/contact", isAnchor: false },
  ].map((item) => ({
    ...item,
    name: t(item.nameKey),
    active: !item.isAnchor && pathname === item.href,
  }));

  return (
    <>
      <SkipToMain />
      <motion.header
        role="banner"
        className="fixed left-0 right-0 z-50 border-0 shadow-none transition-[top] duration-300 ease-in-out"
        style={{ 
          backgroundColor: "#FAF7F4",
          top: "var(--banner-height, 0px)"
        }}
        initial={prefersReducedMotion ? false : { y: -100 }}
        animate={prefersReducedMotion ? undefined : { y: 0 }}
        transition={{ duration: 1.1, ease: easeOwlet }}
      >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex min-h-[72px] items-center justify-between py-3 md:py-2">
          {/* Left Side - Hamburger Menu (Both languages) */}
          <div className="flex-shrink-0 flex items-center gap-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-dark-gray hover:bg-[#D7D8DA] hover:text-dark-gray cursor-pointer rounded-full transition-all duration-200"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">{t("accessibility.openMenu")}</span>
                  </Button>
                </SheetTrigger>
              </div>
              {/* Desktop Hamburger Menu */}
              <div className="hidden md:block">
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-dark-gray hover:bg-[#D7D8DA] hover:text-dark-gray cursor-pointer rounded-full transition-all duration-200"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">{t("accessibility.openMenu")}</span>
                  </Button>
                </SheetTrigger>
              </div>
              {/* Menu Content */}
              <SheetContent
                side={locale === "he" ? "right" : "left"}
                className="w-[300px] sm:w-[400px]"
                aria-label={t("nav.menuAriaLabel")}
              >
                <SheetTitle className="sr-only">{t("nav.menuAriaLabel")}</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Navigation */}
                  <nav className="flex-1 pt-14 pb-6" aria-label={t("nav.mainNavAriaLabel")}>
                    <div
                      className={`space-y-3 ${
                        locale === "he" ? "pr-6" : "pl-6"
                      }`}
                    >
                      {mobileNavigationItems.map((item) => (
                        <a
                          key={item.nameKey}
                          href={item.href}
                          onClick={(e) => {
                            setIsOpen(false);
                            handleNavClick(e, item.href, item.isAnchor);
                          }}
                          className={`block text-lg font-body-bold transition-colors duration-200 ${
                            item.active
                              ? "text-primary-orange"
                              : "text-dark-gray hover:text-primary-orange"
                          }`}
                          aria-current={item.active ? "page" : undefined}
                        >
                          {item.name}
                        </a>
                      ))}
                      {/* Language Switcher - Mobile */}
                      <div className="mt-6 pr-0">
                        <LanguageSwitcher
                          variant="mobile"
                          onLanguageChange={() => setIsOpen(false)}
                        />
                      </div>
                      {/* CTA Button */}
                      <div className="mt-6 pr-0">
                        <a href="/upload" aria-label={t("nav.createBookAriaLabel")}>
                          <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-6 py-2 rounded-full font-body-bold text-sm transition-all duration-200">
                            {t("nav.createBook")}
                          </Button>
                        </a>
                      </div>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center - Logo (Perfectly Centered using absolute positioning) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <a href="/" className="block" aria-label={t("accessibility.homeLink")}>
              <Image
                src="/logo.svg"
                alt="Little Gali"
                width={1440}
                height={432}
                priority
                className="h-24 w-auto md:h-24 md:w-auto lg:h-30 lg:w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
              />
            </a>
          </div>

          {/* Right Side - Cart / Language Switcher (Both languages) */}
          <div className="flex items-center gap-4 py-2">
            {/* Mobile Cart Icon */}
            <div className="md:hidden">
              <CartDrawer />
            </div>
            {/* Desktop Cart + Language Switcher */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher variant="desktop" />
              <CartDrawer />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
    </>
  );
}
