"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

const INSTAGRAM_URL = "https://www.instagram.com/little.gali/";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61583927914508";

type FooterLink = {
  labelKey: string;
  href: string;
};

type FooterColumnProps = {
  titleKey: string;
  links: FooterLink[];
  t: (key: string) => string;
  isRtl: boolean;
};

const footerLinkClass =
  "font-body text-sm font-normal text-warm-taupe transition-colors hover:text-white";

function FooterColumn({ titleKey, links, t, isRtl }: FooterColumnProps) {
  return (
    <div className="text-start" dir={isRtl ? "rtl" : "ltr"}>
      <h3 className="mb-3 font-heading text-base font-bold text-warm-taupe">
        {t(titleKey)}
      </h3>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.labelKey}>
            <a href={link.href} className={footerLinkClass}>
              {t(link.labelKey)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CABCB3]/50 text-warm-taupe transition-colors hover:border-[#CABCB3] hover:text-white"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M14 8.5h2.5l-.5 3H14v9h-3.5v-9H9v-3h1.5V7.5c0-2.2 1.3-3.5 3.4-3.5H14v3h-1.6c-.6 0-.9.3-.9.9V8.5z" />
    </svg>
  );
}

function ContactChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 9h10M7 13h6" strokeLinecap="round" />
      <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3V6a2 2 0 0 1 2-2z" strokeLinejoin="round" />
    </svg>
  );
}

export function Footer() {
  const { t, locale } = useLanguage();
  const isRtl = locale === "he";

  const productLinks: FooterLink[] = [
    { labelKey: "footer.babyBooks", href: "/upload" },
    { labelKey: "nav.giftCard", href: "/#gift-card" },
  ];

  return (
    <footer className="bg-[#2F1C11]">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-16"
        >
          {/* Brand — first in DOM, appears on the right in RTL */}
          <div className="-translate-y-8 lg:col-span-5">
            <div className="mx-auto flex w-max max-w-[17rem] flex-col items-center [direction:ltr]">
              <div className="mb-5 flex justify-center">
                <Image
                  src="/footer-logo-white.svg"
                  alt="Little Gali"
                  width={488}
                  height={420}
                  className="h-28 w-auto object-contain lg:h-32"
                />
              </div>
              <p
                className="mb-6 w-full whitespace-pre-line text-center font-body text-sm font-normal leading-relaxed text-warm-taupe"
                dir={isRtl ? "rtl" : "ltr"}
              >
                {t("footer.description")}
              </p>
              <div className="mb-5 flex items-center justify-center gap-3">
                <SocialIconLink href={INSTAGRAM_URL} label="Instagram">
                  <InstagramIcon />
                </SocialIconLink>
                <SocialIconLink href={FACEBOOK_URL} label="Facebook">
                  <FacebookIcon />
                </SocialIconLink>
              </div>
              <Link
                href="/contact"
                aria-label={t("footer.contactUsAriaLabel")}
                className="inline-flex items-center justify-center gap-2 font-body-bold text-sm text-primary-orange transition-opacity hover:opacity-80"
                dir={isRtl ? "rtl" : "ltr"}
              >
                <ContactChatIcon />
                {t("footer.contactUs")}
              </Link>
            </div>
          </div>

          {/* Link columns — mobile: platform | products+info stacked */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 [direction:ltr] lg:col-span-7 lg:grid-cols-3 lg:gap-8">
            <FooterColumn
              titleKey="footer.platform"
              links={[
                { labelKey: "footer.howItWorks", href: "/#how-it-works" },
                { labelKey: "nav.qa", href: "/qa" },
              ]}
              t={t}
              isRtl={isRtl}
            />
            <div className="flex flex-col gap-10 lg:contents">
              <FooterColumn
                titleKey="footer.products"
                links={productLinks}
                t={t}
                isRtl={isRtl}
              />
              <FooterColumn
                titleKey="footer.information"
                links={[
                  { labelKey: "footer.whoWeAre", href: "/#about" },
                  { labelKey: "footer.terms", href: "/terms" },
                  { labelKey: "footer.shipping", href: "/shipping" },
                  { labelKey: "footer.returns", href: "/returns" },
                ]}
                t={t}
                isRtl={isRtl}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-[#CABCB3]/15 bg-[#2F1C11]">
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="container mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
        >
          <p className="font-body text-xs font-normal text-warm-taupe sm:text-sm">
            {t("footer.copyright")}
          </p>
          <div className="flex shrink-0 gap-6">
            <a href="/privacy" className={footerLinkClass}>
              {t("footer.privacy")}
            </a>
            <a href="/terms" className={footerLinkClass}>
              {t("footer.termsOfUse")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
