"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const easeOwlet = [0.16, 1, 0.3, 1];

export function Header() {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const hash = href.substring(1); // Remove the leading "/"

      if (pathname !== "/") {
        // If not on home page, navigate first
        router.push(href);
        // Scroll after navigation - wait a bit longer for page to load
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            const yOffset = -80; // Offset for header
            const y =
              element.getBoundingClientRect().top +
              window.pageYOffset +
              yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }, 300);
      } else {
        // If already on home page, just scroll
        const element = document.querySelector(hash);
        if (element) {
          const yOffset = -80; // Offset for header
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }
    } else if (href.startsWith("/") && !href.startsWith("/#")) {
      // Regular page navigation
      e.preventDefault();
      router.push(href);
    }
  };

  // Desktop navigation (left to right: Home, About, etc.)
  const desktopNavigationItems = [
    { name: "צור קשר", href: "/contact" },
    { name: "השראה", href: "/inspiration" },
    { name: "שאלות ותשובות", href: "/qa" },
    { name: "אודותינו", href: "/#about" },
    { name: "בית", href: "/" },
  ].map((item) => ({
    ...item,
    active: pathname === item.href,
  }));

  // Mobile navigation (top to bottom: Home, About, etc.)
  const mobileNavigationItems = [
    { name: "בית", href: "/" },
    { name: "אודותינו", href: "/#about" },
    { name: "שאלות ותשובות", href: "/qa" },
    { name: "השראה", href: "/inspiration" },
    { name: "צור קשר", href: "/contact" },
  ].map((item) => ({
    ...item,
    active: pathname === item.href,
  }));

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-soft-peach-light"
      initial={prefersReducedMotion ? false : { y: -100 }}
      animate={prefersReducedMotion ? undefined : { y: 0 }}
      transition={{ duration: 1.1, ease: easeOwlet }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left Side - CTA Button (Desktop) / Menu Button (Mobile) */}
          <div className="py-2">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-dark-gray hover:text-primary-orange"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>
            {/* Desktop CTA Button */}
            <div className="hidden md:block">
              <a href="/upload">
                <button className="cursor-pointer border border-primary-orange text-primary-orange hover:bg-[#e5543d] hover:text-white px-6 py-2 rounded-full font-body-bold text-sm transition-all duration-200">
                  צרו ספרון
                </button>
              </a>
            </div>
          </div>

          {/* Center - Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 py-2 flex-1 justify-center">
            {desktopNavigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative text-sm font-body-bold transition-colors duration-200 ${
                  item.active
                    ? "text-primary-orange"
                    : "text-dark-gray hover:text-primary-orange"
                }`}
              >
                {item.name}
                {item.active && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-primary-orange"></div>
                )}
              </a>
            ))}
          </nav>

          {/* Right Side - Logo */}
          <div className="flex-shrink-0 py-2">
            <a href="/" className="block">
              <img
                src="/logo.png"
                alt="Little Gali"
                width={200}
                height={60}
                className="h-10 w-auto lg:h-12 lg:w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
              />
            </a>
          </div>

          {/* Mobile Menu Content */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                {/* Mobile Navigation */}
                <nav className="flex-1 pt-14 pb-6">
                  <div className="space-y-3 pr-6">
                    {mobileNavigationItems.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={(e) => {
                          setIsOpen(false);
                          handleNavClick(e, item.href);
                        }}
                        className={`block text-lg font-body-bold transition-colors duration-200 ${
                          item.active
                            ? "text-primary-orange"
                            : "text-dark-gray hover:text-primary-orange"
                        }`}
                      >
                        {item.name}
                      </a>
                    ))}
                    {/* Mobile CTA Button */}
                    <div className="mt-6 pr-0">
                      <a href="/upload">
                        <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-6 py-2 rounded-full font-body-bold text-sm transition-all duration-200">
                          צרו ספרון
                        </Button>
                      </a>
                    </div>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
