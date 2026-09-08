"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { isFramedArtEnabled } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";

type CategoryItem = {
  id: string;
  href: string;
  image: string;
  labelKey: string;
  ariaKey: string;
  className: string;
  minHeight: string;
  framedOnly?: boolean;
};

const CATEGORIES: CategoryItem[] = [
  {
    id: "birth-packages",
    href: "/birth-packages",
    image: "/home-category-birth-packages.jpg",
    labelKey: "home.categories.birthPackages",
    ariaKey: "home.categories.birthPackagesAria",
    className: "md:col-start-1 md:row-span-2 md:min-h-[520px]",
    minHeight: "min-h-[280px] sm:min-h-[320px]",
  },
  {
    id: "soft-book",
    href: "/soft-book",
    image: "/home-category-soft-book.jpg",
    labelKey: "home.categories.softBook",
    ariaKey: "home.categories.softBookAria",
    className: "md:col-start-2 md:row-start-1 md:min-h-[200px]",
    minHeight: "min-h-[200px] sm:min-h-[220px]",
  },
  {
    id: "framed-art",
    href: "/framed-art",
    image: "/home-category-framed-art.jpg",
    labelKey: "home.categories.framedArt",
    ariaKey: "home.categories.framedArtAria",
    className: "md:col-start-2 md:row-start-2 md:min-h-[308px]",
    minHeight: "min-h-[240px] sm:min-h-[280px]",
    framedOnly: true,
  },
];

export function HomeCategoryBento() {
  const { t } = useLanguage();
  const framedOn = isFramedArtEnabled();

  const items = CATEGORIES.filter((item) => !item.framedOnly || framedOn);

  return (
    <section
      aria-label={t("home.categories.ariaLabel")}
      className="w-full bg-[#FAF7F4] py-6 sm:py-8 lg:py-10"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          dir="ltr"
          className={cn(
            "mx-auto grid max-w-6xl grid-cols-1 gap-2.5 sm:gap-3",
            framedOn ? "md:grid-cols-2 md:grid-rows-2" : "md:grid-cols-2",
          )}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-label={t(item.ariaKey)}
              className={cn(
                "relative block cursor-pointer overflow-hidden",
                item.minHeight,
                framedOn ? item.className : "md:min-h-[320px]",
              )}
            >
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-black/25"
                aria-hidden
              />
              <span className="absolute inset-0 z-10 flex items-center justify-center px-4 text-center font-heading text-base font-bold tracking-wide text-white sm:px-5 sm:text-lg lg:text-xl">
                {t(item.labelKey)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
