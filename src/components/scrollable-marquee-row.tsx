"use client";

import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** After the user scrolls, wait this long before moving on by itself again. */
const RESUME_AFTER_MS = 2500;

/**
 * A row that moves by itself like MarqueeRow, but the user can also scroll it both ways:
 * swipe on phones, trackpad or the arrow buttons on bigger screens. Endless in both
 * directions: two identical copies, and the scroll position wraps by one copy's width.
 * With reduced motion it only scrolls when the user scrolls.
 */
export function ScrollableMarqueeRow<T>({
  items,
  getKey,
  renderItem,
  durationSeconds,
  gapClassName,
  paused = false,
  previousLabel,
  nextLabel,
}: {
  items: readonly T[];
  getKey: (item: T) => string | number;
  /** `isCopy` is true for the second, hidden-from-screen-readers copy. */
  renderItem: (item: T, isCopy: boolean) => ReactNode;
  /** Time for one full loop of all items. */
  durationSeconds: number;
  /** Space between tiles. The trailing padding must equal the gap so the loop has no jump. */
  gapClassName: string;
  /** Hold the row still, e.g. while a popup about one of its items is open. */
  paused?: boolean;
  previousLabel: string;
  nextLabel: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const firstCopyRef = useRef<HTMLDivElement>(null);
  // Auto-scroll pauses until this time (ms, performance.now()); Infinity while a finger is down.
  const pausedUntilRef = useRef(0);
  const hoveringRef = useRef(false);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const firstCopy = firstCopyRef.current;
    if (!scroller || !firstCopy) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const copyWidth = () => firstCopy.offsetWidth;

    // Start one copy in, so the user can scroll back from the very beginning.
    let position = copyWidth();
    let lastSet = position;
    scroller.scrollLeft = position;

    const setScroll = (value: number) => {
      position = value;
      scroller.scrollLeft = value;
      lastSet = scroller.scrollLeft;
    };

    /** Keeps the position inside the second copy's range, so there is always room both ways. */
    const wrap = () => {
      const width = copyWidth();
      if (width <= 0) return;
      if (position >= width * 2 - scroller.clientWidth) setScroll(position - width);
      else if (position < scroller.clientWidth) setScroll(position + width);
    };

    const onScroll = () => {
      // A scroll we didn't make is the user's: follow it and hold off auto-scroll.
      if (Math.abs(scroller.scrollLeft - lastSet) > 2) {
        position = scroller.scrollLeft;
        lastSet = position;
        if (pausedUntilRef.current !== Infinity) {
          pausedUntilRef.current = performance.now() + RESUME_AFTER_MS;
        }
        wrap();
      }
    };

    const onPressStart = () => {
      pausedUntilRef.current = Infinity;
    };
    const onPressEnd = () => {
      pausedUntilRef.current = performance.now() + RESUME_AFTER_MS;
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("touchstart", onPressStart, { passive: true });
    scroller.addEventListener("touchend", onPressEnd, { passive: true });
    scroller.addEventListener("touchcancel", onPressEnd, { passive: true });

    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(now - previous, 100);
      previous = now;
      if (
        !reducedMotion &&
        !hoveringRef.current &&
        !pausedRef.current &&
        now >= pausedUntilRef.current
      ) {
        const speed = copyWidth() / durationSeconds; // px per second
        setScroll(position + (speed * elapsed) / 1000);
        wrap();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("touchstart", onPressStart);
      scroller.removeEventListener("touchend", onPressEnd);
      scroller.removeEventListener("touchcancel", onPressEnd);
    };
  }, [durationSeconds, items]);

  const scrollByCard = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    const tiles = firstCopyRef.current?.children;
    if (!scroller || !tiles || tiles.length === 0) return;
    const step =
      tiles.length > 1
        ? (tiles[1] as HTMLElement).offsetLeft - (tiles[0] as HTMLElement).offsetLeft
        : (tiles[0] as HTMLElement).offsetWidth;
    pausedUntilRef.current = performance.now() + RESUME_AFTER_MS;
    scroller.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const arrowClass =
    "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#E8DFD4] bg-white/90 text-accent-burgundy shadow-sm transition-colors hover:bg-warm-cream sm:flex";

  return (
    // Fixed LTR so scroll math is the same in Hebrew and English; the row moves left.
    <div
      dir="ltr"
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hoveringRef.current = true;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") hoveringRef.current = false;
      }}
    >
      <div
        ref={scrollerRef}
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              ref={copy === 0 ? firstCopyRef : undefined}
              className={`flex ${gapClassName}`}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {items.map((item) => (
                <Fragment key={getKey(item)}>
                  {renderItem(item, copy === 1)}
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Physical left/right on purpose: the row itself is always LTR. */}
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        aria-label={previousLabel}
        className={`${arrowClass} left-3 lg:left-6`}
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        aria-label={nextLabel}
        className={`${arrowClass} right-3 lg:right-6`}
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
