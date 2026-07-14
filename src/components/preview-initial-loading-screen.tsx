"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/LanguageContext";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import { cn } from "@/lib/utils";

export type PreviewInitialLoadingScreenProps = {
  imageUrls: string[];
  isExiting: boolean;
  isComplete: boolean;
  loadingLine: string;
  slowText: string;
  standardText: string;
  title: string;
  locale?: Locale;
  /** Full-viewport overlay (upload page); default fits preview main layout. */
  variant?: "inline" | "overlay";
};

function AvatarRow({
  urls,
  startDelayMs,
  locale,
}: {
  urls: string[];
  startDelayMs: number;
  locale: Locale;
}) {
  const avatarDir = locale === "he" ? "rtl" : "ltr";
  return (
    <div
      className="flex min-h-[4.5rem] justify-center md:min-h-20"
      dir={avatarDir}
      aria-hidden={urls.length === 0}
    >
      {urls.map((url, index) => (
        <div
          key={`${url}-${index}`}
          className="preview-loading-avatar h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full border-[4px] border-[#F6D8DD] bg-white shadow-[0_10px_26px_rgba(105,52,48,0.14)] md:h-20 md:w-20"
          style={{
            animationDelay: `${startDelayMs + index * 140}ms`,
            marginInlineStart: index === 0 ? 0 : -18,
            zIndex: urls.length - index,
          }}
        >
          <img
            src={url}
            alt=""
            className={cn(
              SENTRY_REPLAY_BLOCK_USER_IMAGE,
              "h-full w-full object-cover",
            )}
          />
        </div>
      ))}
    </div>
  );
}

export function PreviewInitialLoadingScreen({
  imageUrls,
  isExiting,
  isComplete,
  loadingLine,
  slowText,
  standardText,
  title,
  locale = "he",
  variant = "inline",
}: PreviewInitialLoadingScreenProps) {
  const [isTakingLonger, setIsTakingLonger] = useState(false);
  const [displayLine, setDisplayLine] = useState(loadingLine);
  const [lineVisible, setLineVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsTakingLonger(true), 90000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (loadingLine === displayLine) {
      return;
    }
    setLineVisible(false);
    const timeout = setTimeout(() => {
      setDisplayLine(loadingLine);
      setLineVisible(true);
    }, 180);
    return () => clearTimeout(timeout);
  }, [displayLine, loadingLine]);

  const useTwoRows = imageUrls.length > 5;
  const firstRow = useTwoRows ? imageUrls.slice(0, 5) : imageUrls.slice(0, 5);
  const secondRow = useTwoRows ? imageUrls.slice(5, 9) : [];

  return (
    <section
      className={cn(
        "flex items-center justify-center px-4 py-10 text-center opacity-100 transition-opacity duration-[400ms] ease-out",
        variant === "overlay"
          ? "fixed inset-0 z-50 min-h-screen"
          : "min-h-[calc(100vh-72px-var(--banner-height,0px))]",
        isExiting && "opacity-0",
      )}
      style={
        variant === "overlay" ? { backgroundColor: "#F3EEE8" } : undefined
      }
      aria-busy={!isComplete}
    >
      <div className="flex w-full max-w-2xl flex-col items-center">
        <div className="mb-7 flex flex-col items-center gap-3">
          <AvatarRow urls={firstRow} startDelayMs={0} locale={locale} />
          {secondRow.length > 0 && (
            <AvatarRow urls={secondRow} startDelayMs={700} locale={locale} />
          )}
        </div>

        <h1 className="max-w-xl font-heading text-2xl leading-[1.15] text-accent-burgundy md:text-3xl">
          {title}
        </h1>

        <div className="mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-[#EAD9D4] shadow-inner md:w-56">
          <div
            className={cn(
              "h-full origin-left rounded-full bg-primary-orange",
              isComplete
                ? "preview-initial-progress-complete"
                : "preview-initial-progress",
            )}
          />
        </div>

        <div className="mt-8 flex min-h-8 items-center justify-center">
          <p
            className={cn(
              "font-body-bold text-lg text-dark-gray transition-opacity duration-200 md:text-xl",
              lineVisible ? "opacity-100" : "opacity-0",
            )}
          >
            {displayLine.endsWith("...")
              ? displayLine
              : `${displayLine}...`}
          </p>
        </div>

        <div className="mt-7 flex min-h-10 items-center justify-center">
          <p className="font-body text-sm text-dark-gray">
            {isTakingLonger ? slowText : standardText}
          </p>
        </div>
      </div>
    </section>
  );
}
