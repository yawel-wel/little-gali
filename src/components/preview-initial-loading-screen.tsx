"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Locale } from "@/lib/LanguageContext";
import { GiftSetFlowBadge } from "@/components/gift-set-flow-badge";
import { isPreviewLoadingOrbitEnabled } from "@/lib/feature-flags";
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
          className="preview-loading-avatar h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full border-2 border-primary-orange bg-white shadow-[0_10px_26px_rgba(105,52,48,0.14)] md:h-20 md:w-20"
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

/** Milliseconds for one full turn of the orbit. */
const ORBIT_TURN_MS = 7000;
/** Ring radius in px; fits a ~343px phone column. */
const ORBIT_RADIUS = 125;
/** Gap between neighbouring photos, as a fraction of one turn. */
const ORBIT_MAX_GAP = 0.12;
/** The whole group never spans more than this fraction of the ring. */
const ORBIT_MAX_SPREAD = 0.62;
/** Must match the curve in globals.css (`preview-orbit-move`). */
const ORBIT_EASE_DEG = 144 / (2 * Math.PI);

/** Angle on the ring at turn progress p (0 = front), same curve as the CSS. */
function orbitAngleAt(progress: number) {
  return 360 * progress - ORBIT_EASE_DEG * Math.sin(2 * Math.PI * progress);
}

/**
 * One photo on the orbit. Its position comes from the wall clock, so if it is
 * re-created (photo URL swapped, phase change, upload → preview page) it
 * carries on from exactly where it was instead of restarting.
 */
function OrbitItem({
  url,
  progress,
  radius,
  showHaze,
}: {
  url: string;
  /** Where this photo sits in the group, as a fraction of a turn (0 = front). */
  progress: number;
  radius: number;
  showHaze: boolean;
}) {
  // Normalised to [0, 1) so the animation delay is never positive (a positive
  // delay would hold the photo still until it kicks in).
  const turnProgress = ((progress % 1) + 1) % 1;
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Negative delay = "this animation started (now % turn) ms ago", which
    // lines every photo up with the same shared clock.
    ref.current?.style.setProperty(
      "--orbit-clock",
      `${-(Date.now() % ORBIT_TURN_MS)}ms`,
    );
  }, []);

  return (
    <div
      ref={ref}
      className="preview-orbit-item absolute inset-0 m-auto h-[4.5rem] w-[4.5rem] md:h-20 md:w-20"
      style={
        {
          // Static position, used when the visitor prefers reduced motion.
          "--orbit-angle": `${orbitAngleAt(turnProgress)}deg`,
          "--orbit-radius": `${radius}px`,
          "--orbit-offset": `${-turnProgress * ORBIT_TURN_MS}ms`,
        } as CSSProperties
      }
    >
      <div className="h-full w-full overflow-hidden rounded-full border-2 border-primary-orange bg-white shadow-[0_10px_26px_rgba(105,52,48,0.14)]">
        <img
          src={url}
          alt=""
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className={cn(SENTRY_REPLAY_BLOCK_USER_IMAGE, "h-full w-full object-cover")}
        />
      </div>
      {/* Depth haze: photos at the back fade toward the page color. */}
      {showHaze && (
        <div className="preview-orbit-haze pointer-events-none absolute inset-0 rounded-full bg-[#F3EEE8]" />
      )}
    </div>
  );
}

/**
 * Photos on a tilted 3D ring that slowly turns: each one grows as it comes
 * to the front and shrinks / fades as it goes round the back.
 */
function AvatarOrbit({ urls }: { urls: string[] }) {
  const count = urls.length;
  const radius = count <= 1 ? 0 : ORBIT_RADIUS;
  // Photos travel as one group with even gaps in time, covering only part of
  // the ring. Because they slow down at the front, the group bunches up as it
  // passes the viewer and stretches out round the back.
  const gap = count > 1 ? Math.min(ORBIT_MAX_GAP, ORBIT_MAX_SPREAD / (count - 1)) : 0;
  return (
    <div
      className="preview-orbit-stage relative h-28 w-full max-w-[340px]"
      style={{ "--orbit-turn": `${ORBIT_TURN_MS}ms` } as CSSProperties}
      aria-hidden={count === 0}
    >
      <div className="preview-orbit-tilt absolute inset-0">
        {urls.map((url, index) => (
          <OrbitItem
            // Keyed by position, not URL: when a local photo is swapped for
            // the uploaded copy, only the image changes; the photo keeps moving.
            key={index}
            url={url}
            // Centred on the front, so the reduced-motion view shows the
            // group facing the viewer.
            progress={(index - (count - 1) / 2) * gap}
            radius={radius}
            showHaze={count > 1}
          />
        ))}
      </div>
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
        {isPreviewLoadingOrbitEnabled() ? (
          <div className="mb-7 flex w-full justify-center">
            <AvatarOrbit urls={imageUrls.slice(0, 9)} />
          </div>
        ) : (
          <div className="mb-7 flex flex-col items-center gap-3">
            <AvatarRow urls={firstRow} startDelayMs={0} locale={locale} />
            {secondRow.length > 0 && (
              <AvatarRow urls={secondRow} startDelayMs={700} locale={locale} />
            )}
          </div>
        )}

        <GiftSetFlowBadge className="mb-1" />
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
