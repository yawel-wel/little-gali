"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: "בית", href: "#", active: true },
    { name: "אודותינו", href: "#" },
    { name: "מוצרים", href: "#" },
    { name: "בלוג", href: "#" },
    { name: "צור קשר", href: "#" },
  ];

  return (
    <header className="relative bg-white border-b border-soft-peach-light">
      {/* Decorative wave pattern */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-soft-peach via-primary-orange to-soft-peach opacity-60">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgMTAwIDIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCAxMEMxMCA1IDIwIDE1IDMwIDEwQzQwIDUgNTAgMTUgNjAgMTBDNzAgNSA4MCAxNSA5MCAxMEMxMDAgNSAxMDAgMTAgMTAwIDEwVjIwSDBWMTBaIiBmaWxsPSIjRkZGRkZGIiBmaWxsLW9wYWNpdHk9IjAuMyIvPgo8L3N2Zz4K')] opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-2">
          {/* Mobile Header Row */}
          <div className="flex items-center justify-between w-full md:hidden h-12">
            {/* Mobile Menu Button */}
            <div className="flex-shrink-0">
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

            {/* Mobile Logo */}
            <div className="flex-shrink-0">
              <img
                src="/logo-mobile.png"
                alt="Little Gali"
                width={150}
                height={45}
                className="h-8 w-auto"
              />
            </div>

            {/* Empty div for spacing */}
            <div className="w-10"></div>
          </div>

          {/* Desktop Logo */}
          <div className="hidden md:block flex-shrink-0 mb-4">
            <img
              src="/logo.png"
              alt="Little Gali"
              width={200}
              height={60}
              className="h-12 w-auto lg:h-16 lg:w-auto"
            />
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
