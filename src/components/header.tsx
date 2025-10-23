"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: "צור קשר", href: "#" },
    { name: "בלוג", href: "#" },
    { name: "מוצרים", href: "#" },
    { name: "אודותינו", href: "#" },
    { name: "בית", href: "#", active: true },
  ];

  return (
    <header className="relative bg-[#F9F7EE] border-b border-soft-peach-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="border border-primary-orange text-primary-orange hover:bg-[#e5543d] hover:text-white px-6 py-2 rounded-full font-body-bold text-sm transition-all duration-200">
              קנו תבנית
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
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

          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="/logo.png"
              alt="Little Gali"
              width={200}
              height={60}
              className="h-10 w-auto lg:h-12 lg:w-auto"
            />
          </div>

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

          {/* Mobile Menu Content */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                {/* Mobile Navigation */}
                <nav className="flex-1 pt-14 pb-6">
                  <div className="space-y-3 pr-6">
                    {navigationItems.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`block text-lg font-body-bold transition-colors duration-200 ${
                          item.active
                            ? "text-primary-orange"
                            : "text-dark-gray hover:text-primary-orange"
                        }`}
                        onClick={() => setIsOpen(false)}
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
