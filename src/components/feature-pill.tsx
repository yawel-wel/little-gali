import type { ReactElement } from "react";

export type FeaturePillIcon =
  | "gift"
  | "award"
  | "stroller"
  | "clock"
  | "ai"
  | "patent"
  | "magnet"
  | "palette";

const ICON_COLOR = "#4b5563";

function PillIcon({ icon }: { icon: FeaturePillIcon }) {
  const icons: Record<FeaturePillIcon, ReactElement> = {
    gift: (
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="8" width="18" height="13" rx="1" />
        <path d="M12 8v13M3 12h18M12 8c-2-3-4-3-4 0s2 3 4 3 4-3 4-3-2-3-4 0" />
      </svg>
    ),
    award: (
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="9.5" r="4" />
        <path d="M9.5 12.5L8.25 17.5l3.75-2 3.75 2-1.25-5" />
      </svg>
    ),
    stroller: (
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 7.5h5" />
        <path d="M7.5 7.5v3" />
        <path d="M7.5 10.5h9" />
        <path d="M16.5 10.5V8.5a4.5 3 0 0 0-8 0v2" />
        <path d="M7.5 10.5v3.5a2 2.5 0 0 0 2 2.5h5a2 2.5 0 0 0 2-2.5v-3.5" />
        <path d="M9.5 16.5v2" />
        <path d="M14.5 16.5v2" />
        <circle cx="9.5" cy="20.5" r="1.75" />
        <circle cx="14.5" cy="20.5" r="1.75" />
      </svg>
    ),
    clock: (
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="7" />
        <path d="M12 9v3.25l2.75 1.75" />
      </svg>
    ),
    ai: (
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.5 3l1 3.5L14 7.5l-3.5 1L9.5 12l-1-3.5L5 7.5l3.5-1L9.5 3z" />
        <path d="M17.5 13l.75 2.25L20.5 16l-2.25.75L17.5 19l-.75-2.25L14.5 16l2.25-.75L17.5 13z" />
      </svg>
    ),
    patent: (
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v2" />
        <circle cx="12" cy="2.5" r="1" />
        <rect x="5" y="5" width="14" height="11" rx="1.5" />
        <path d="M8 19h8" />
        <path d="M10 19v2M14 19v2" />
      </svg>
    ),
    magnet: (
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 4v8a6 6 0 0 0 12 0V4" />
        <path d="M6 4h3v5H6M15 4h3v5h-3" />
      </svg>
    ),
    palette: (
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3c-4.5 0-8 3-8 7a5 5 0 0 0 5 5h1.5a2 2 0 0 1 2 2c0 1.1.9 2 2 2h.5a4 4 0 0 0 4-4c0-6.5-5.5-12-7-12z" />
        <circle cx="8.5" cy="9" r="0.75" fill={ICON_COLOR} stroke="none" />
        <circle cx="11.5" cy="7" r="0.75" fill={ICON_COLOR} stroke="none" />
        <circle cx="14.5" cy="9" r="0.75" fill={ICON_COLOR} stroke="none" />
      </svg>
    ),
  };

  const iconNudge: Partial<Record<FeaturePillIcon, string>> = {
    gift: "-translate-y-px",
    clock: "translate-y-px",
    stroller: "-translate-y-px",
  };

  return (
    <span
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center ${iconNudge[icon] ?? ""}`}
    >
      {icons[icon]}
    </span>
  );
}

export function FeaturePill({
  label,
  icon,
  highlighted = false,
  locale,
}: {
  label: string;
  icon: FeaturePillIcon;
  highlighted?: boolean;
  locale: string;
}) {
  const iconWrap = <PillIcon icon={icon} />;

  const labelNudge: Partial<Record<FeaturePillIcon, string>> = {
    award: "-translate-y-px",
  };

  const labelClassName = `leading-4 ${labelNudge[icon] ?? ""}`;

  const pillInner = (
    <span className="inline-flex items-center gap-1">
      {locale === "he" ? (
        <>
          {iconWrap}
          <span className={labelClassName}>{label}</span>
        </>
      ) : (
        <>
          <span className={labelClassName}>{label}</span>
          {iconWrap}
        </>
      )}
    </span>
  );

  if (highlighted) {
    return (
      <span className="relative inline-block">
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-[#F9F7EE] py-[6px] pl-3 pr-3 text-xs font-body text-dark-gray lg:py-[7px] lg:pl-4 lg:pr-[14px] lg:text-sm">
          {pillInner}
        </span>
        <span
          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-orange ring-2 ring-white lg:-top-1.5 lg:h-5 lg:w-5"
          aria-hidden="true"
        >
          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.09 6.26L20.5 9.5l-5 3.64L17.18 20 12 16.77 6.82 20l1.68-6.86-5-3.64 6.41-1.24L12 2z" />
          </svg>
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-[#F9F7EE] py-[6px] pl-3 pr-3 text-xs font-body text-dark-gray lg:py-[7px] lg:pl-4 lg:pr-[14px] lg:text-sm">
      {pillInner}
    </span>
  );
}

export function BookFeaturePills({
  t,
  locale,
}: {
  t: (key: string) => string;
  locale: string;
}) {
  const isHebrew = locale === "he";
  const rowAlign = isHebrew ? "lg:ml-auto" : "lg:mr-auto";

  return (
    <div className="flex w-full flex-col items-center gap-1.5 lg:gap-2">
      <div
        dir={isHebrew ? "rtl" : "ltr"}
        className={`inline-flex flex-wrap justify-center gap-2 ${rowAlign}`}
      >
        <FeaturePill locale={locale} label={t("home.book.pill.standards")} icon="award" highlighted />
        <FeaturePill locale={locale} label={t("home.book.pill.birthGift")} icon="gift" />
      </div>
      <div
        dir={isHebrew ? "rtl" : "ltr"}
        className={`inline-flex flex-wrap justify-center gap-2 ${rowAlign}`}
      >
        <FeaturePill locale={locale} label={t("home.book.pill.ai")} icon="ai" />
        <FeaturePill locale={locale} label={t("home.book.pill.tummyTime")} icon="clock" />
        <FeaturePill locale={locale} label={t("home.book.pill.stroller")} icon="stroller" />
      </div>
    </div>
  );
}

export function FramedArtFeaturePills({
  t,
  locale,
}: {
  t: (key: string) => string;
  locale: string;
}) {
  const isHebrew = locale === "he";
  const rowAlign = isHebrew ? "lg:ml-auto" : "lg:mr-auto";

  return (
    <div className="flex w-full flex-col items-center gap-1.5 lg:gap-2">
      <div
        dir={isHebrew ? "rtl" : "ltr"}
        className={`inline-flex flex-wrap justify-center gap-2 ${rowAlign}`}
      >
        <FeaturePill locale={locale} label={t("home.framedArt.pill.patent")} icon="patent" />
        <FeaturePill locale={locale} label={t("home.framedArt.pill.removable")} icon="magnet" />
        <FeaturePill locale={locale} label={t("home.framedArt.pill.gift")} icon="gift" />
      </div>
    </div>
  );
}

export function FreePreviewNote({
  label,
  locale = "he",
  className = "",
}: {
  label: string;
  locale?: string;
  className?: string;
}) {
  const icon = (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );

  return (
    <p className={`text-sm font-body text-[#757575] ${className}`}>
      <span
        dir="ltr"
        className={`inline-flex items-center gap-1.5 ${
          locale === "he" ? "flex-row-reverse" : ""
        }`}
      >
        {icon}
        <span dir={locale === "he" ? "rtl" : "ltr"}>{label}</span>
      </span>
    </p>
  );
}
