import { Fragment, type CSSProperties, type ReactNode } from "react";

/** Size of one marquee tile. Shared so every marquee on the site has the same tile size. */
export const MARQUEE_TILE_CLASS =
  "relative aspect-[3/4] w-[27vw] shrink-0 overflow-hidden rounded-[5px] lg:w-[15vw] lg:max-w-64";

/**
 * One endlessly scrolling row of tiles (see `.book-in-use-marquee` in globals.css).
 * Pauses on hover; with reduced motion it becomes a plain horizontal scroll.
 */
export function MarqueeRow<T>({
  items,
  getKey,
  renderItem,
  reverse = false,
  durationSeconds,
  gapClassName = "gap-2.5 pe-2.5 lg:gap-3.5 lg:pe-3.5",
}: {
  items: readonly T[];
  getKey: (item: T) => string | number;
  /** `isCopy` is true for the second, hidden-from-screen-readers copy. */
  renderItem: (item: T, isCopy: boolean) => ReactNode;
  reverse?: boolean;
  /** Time for one full loop. Defaults to the CSS value (50s); longer rows need more to keep the same speed. */
  durationSeconds?: number;
  /** Space between tiles. The trailing padding must equal the gap so the loop has no jump. */
  gapClassName?: string;
}) {
  const style: CSSProperties | undefined = durationSeconds
    ? { animationDuration: `${durationSeconds}s` }
    : undefined;

  return (
    // Fixed LTR so the -50% loop math is the same in Hebrew and English.
    <div dir="ltr" className="overflow-hidden motion-reduce:overflow-x-auto">
      <div
        className={`book-in-use-marquee flex w-max ${
          reverse ? "book-in-use-marquee-reverse" : ""
        }`}
        style={style}
      >
        {/* Two identical copies: when the first has scrolled out, the second is in its place. */}
        {[0, 1].map((copy) => (
          <div
            key={copy}
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
  );
}
