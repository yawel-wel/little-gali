"use client";

import type { ReactNode } from "react";
import { Truck } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

function StorefrontIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 10.5 5.5 5h13L20 10.5" />
      <path d="M4 10.5h16v1.5H4z" />
      <path d="M4.75 12v7.25h14.5V12" />
      <path d="M10 19.25v-4.5h4v4.5" />
      <path d="M6.25 10.5V8.4M9.5 10.5V7.4M12 10.5V6.9M14.5 10.5V7.4M17.75 10.5V8.4" />
    </svg>
  );
}

type FulfillmentOption = {
  titleKey: string;
  subtitleKey: string;
  priceKey: string;
  icon: ReactNode;
};

type PickupAvailabilityBoxProps = {
  className?: string;
};

export function PickupAvailabilityBox({
  className,
}: PickupAvailabilityBoxProps) {
  const { t, locale } = useLanguage();
  const isHe = locale === "he";

  const options: FulfillmentOption[] = [
    {
      titleKey: "product.pickup.title",
      subtitleKey: "product.pickup.subtitle",
      priceKey: "product.pickup.price",
      icon: (
        <StorefrontIcon className="h-8 w-8 shrink-0 text-dark-gray" />
      ),
    },
    {
      titleKey: "product.delivery.title",
      subtitleKey: "product.delivery.subtitle",
      priceKey: "product.delivery.price",
      icon: (
        <Truck
          className="h-8 w-8 shrink-0 text-dark-gray"
          strokeWidth={1}
          aria-hidden
        />
      ),
    },
  ];

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      {options.map((option) => (
        <div
          key={option.titleKey}
          className="flex w-full items-start gap-3 rounded-2xl border border-[#E8E4DF] px-4 py-3.5"
          dir={isHe ? "rtl" : "ltr"}
        >
          {option.icon}
          <div className="min-w-0 flex-1">
            <p className="font-body-bold text-sm leading-snug text-dark-gray">
              {t(option.titleKey)}
            </p>
            <p className="mt-0.5 font-body text-sm leading-snug text-medium-gray">
              {t(option.subtitleKey)}
            </p>
            <p className="mt-0.5 font-body-bold text-sm leading-snug text-dark-gray">
              {t(option.priceKey)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
