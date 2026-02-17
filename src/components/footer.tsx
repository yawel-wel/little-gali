"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

export function Footer() {
  const { t, locale } = useLanguage();
  return (
    <footer className="bg-white">
      {/* Upper Section - White Background with Columns */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Column 1: Logo/Brand (Right side) */}
          <div className="col-span-2 lg:col-span-1 order-1 lg:order-1">
            <div className="mb-4 lg:mb-0 flex justify-center">
              <Image src="/footer-logo.svg" alt="Little Gali" width={1440} height={432} className="h-24 lg:h-48 w-auto" />
            </div>
            <p
              className={`font-body text-medium-gray text-sm leading-relaxed mb-2 lg:mb-6 text-center`}
            >
              {t("footer.description")}
            </p>
            {/* Social Media Icons - temporarily disabled */}
            {/**
            <div className="flex gap-3">
              ... icons ...
            </div>
            **/}
          </div>

          {/* Column 2: Platform */}
          <div className="order-2 lg:order-2 mt-1 lg:mt-[50px]">
            <h3
              className={`font-heading text-dark-gray text-lg font-bold mb-4 text-center ${
                locale === "en" ? "lg:text-left" : "lg:text-right"
              }`}
            >
              {t("footer.platform")}
            </h3>
            <ul className={`space-y-3 text-center ${locale === "en" ? "lg:text-left" : "lg:text-right"}`}>
              <li>
                <a
                  href="/#how-it-works"
                  className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                >
                  {t("footer.howItWorks")}
                </a>
              </li>
              <li>
                <a
                  href="/inspiration"
                  className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                >
                  {t("footer.inspiration")}
                </a>
              </li>
              <li>
                <a
                  href="/qa"
                  className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                >
                  {t("nav.qa")}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div className="order-3 lg:order-3 mt-1 lg:mt-[50px]">
            <h3
              className={`font-heading text-dark-gray text-lg font-bold mb-4 text-center ${
                locale === "en" ? "lg:text-left" : "lg:text-right"
              }`}
            >
              {t("footer.policies")}
            </h3>
            <ul className={`space-y-3 text-center ${locale === "en" ? "lg:text-left" : "lg:text-right"}`}>
              <li>
                <a
                  href="/terms"
                  className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                >
                  {t("footer.terms")}
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                >
                  {t("footer.privacy")}
                </a>
              </li>
              <li>
                <a
                  href="/shipping"
                  className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                >
                  {t("footer.shipping")}
                </a>
              </li>
              <li>
                <a
                  href="/returns"
                  className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                >
                  {t("footer.returns")}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: About */}
          <div className="order-4 lg:order-4 mt-4 lg:mt-[50px]">
            <h3
              className={`font-heading text-dark-gray text-lg font-bold mb-4 text-center ${
                locale === "en" ? "lg:text-left" : "lg:text-right"
              }`}
            >
              {t("footer.about")}
            </h3>
            <ul className={`space-y-3 text-center ${locale === "en" ? "lg:text-left" : "lg:text-right"}`}>
              <li>
                <a
                  href="/#about"
                  className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                >
                  {t("footer.whoWeAre")}
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                >
                  {t("footer.contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact US (Left side) */}
          <div className="order-5 lg:order-5 mt-4 lg:mt-[50px] flex flex-col items-center lg:items-start">
            <h3
              className={`font-heading text-dark-gray text-lg font-bold mb-4 text-center ${
                locale === "en" ? "lg:text-left" : "lg:text-right"
              }`}
            >
              {t("footer.contact")}
            </h3>
            <a href="/contact">
              <Button className="cursor-pointer text-white px-6 py-2 rounded-md font-body-bold text-sm transition-all duration-200" style={{ backgroundColor: "#693430" }} sx={{ "&:hover": { backgroundColor: "#552a27" } }}>
                {t("footer.contactUs")}
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section - Dark Gray Bar */}
      <div className="py-4" style={{ backgroundColor: "#535453" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center font-body text-white/80 text-sm">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
