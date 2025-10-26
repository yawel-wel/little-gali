"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

export function Header() {
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
    }
  };

  // Desktop navigation (left to right: Home, About, etc.)
  const desktopNavigationItems = [
    { name: "צור קשר", href: "#" },
    { name: "השראה", href: "#" },
    { name: "שאלות ותשובות", href: "/#qa" },
    { name: "הידעת", href: "#" },
    { name: "אודותינו", href: "/#about" },
    { name: "בית", href: "/", active: true },
  ];

  // Mobile navigation (top to bottom: Home, About, etc.)
  const mobileNavigationItems = [
    { name: "בית", href: "/", active: true },
    { name: "אודותינו", href: "/#about" },
    { name: "הידעת", href: "#" },
    { name: "שאלות ותשובות", href: "/#qa" },
    { name: "השראה", href: "#" },
    { name: "צור קשר", href: "#" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-soft-peach-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="cursor-pointer border border-primary-orange text-primary-orange hover:bg-[#e5543d] hover:text-white px-6 py-2 rounded-full font-body-bold text-sm transition-all duration-200">
              צרו ספרון
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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

          {/* Mobile Menu Button - moved to left on mobile */}
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

          {/* Logo - moved to right on mobile */}
          <div className="flex-shrink-0">
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
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
