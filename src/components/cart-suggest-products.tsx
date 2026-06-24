"use client";

import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

function SuggestProductButton({
  title,
  promo,
  icon,
  onClick,
}: {
  title: string;
  promo: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      dir="ltr"
      onClick={onClick}
      className="flex w-full flex-1 items-center justify-between rounded-lg border border-gray-200 bg-[#F7F6F2] px-4 py-3.5 cursor-pointer transition-colors hover:bg-[#efede8]"
    >
      <span className="text-xl leading-none text-medium-gray" aria-hidden>
        +
      </span>

      <div className="flex min-w-0 items-center justify-end gap-3">
        <div className="min-w-0 text-right">
          <p className="truncate font-body-bold text-sm text-dark-gray">
            {title}
          </p>
          <p className="font-body text-xs text-medium-gray">{promo}</p>
        </div>
        <div className="shrink-0 text-accent-burgundy" aria-hidden>
          {icon}
        </div>
      </div>
    </button>
  );
}

export function CartSuggestProducts() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const isHe = locale === "he";

  const iconClass = "h-6 w-6";
  const iconStroke = 1.5;

  return (
    <section
      className="mt-4 w-full"
      dir={isHe ? "rtl" : "ltr"}
      aria-label={t("cart.suggest.ariaLabel")}
    >
      <h2 className="text-sm font-body-bold text-dark-gray md:text-base text-right">
        {t("cart.suggest.title")}
      </h2>

      <div className="mt-3 flex w-full gap-2 justify-start">
        <SuggestProductButton
          title={t("cart.suggest.bookTitle")}
          promo={t("cart.suggest.bookPromo")}
          icon={<BookOpen className={iconClass} strokeWidth={iconStroke} />}
          onClick={() => router.push("/upload")}
        />
      </div>
    </section>
  );
}
