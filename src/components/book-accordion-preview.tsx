"use client";

import { cn } from "@/lib/utils";
import type { BookColor } from "@/lib/book-color";

type PocketConfig = {
  left: string;
  top: string;
  width: string;
  height: string;
  rotate: string;
  skewY: string;
};

// Each pocket's position and transform relative to the book image container.
// The accordion panels alternate angles (lean left / lean right).
const POCKETS: PocketConfig[] = [
  { left: "4%",  top: "12%", width: "16%", height: "62%", rotate: "-7deg", skewY: "5deg"  },
  { left: "21%", top: "8%",  width: "16%", height: "62%", rotate: "3deg",  skewY: "-3deg" },
  { left: "38%", top: "10%", width: "16%", height: "62%", rotate: "-4deg", skewY: "3deg"  },
  { left: "55%", top: "8%",  width: "16%", height: "62%", rotate: "4deg",  skewY: "-3deg" },
  { left: "72%", top: "10%", width: "16%", height: "62%", rotate: "-5deg", skewY: "3deg"  },
];

const BOOK_IMAGES: Record<BookColor, string> = {
  light: "/book-preview-light.jpg",
  dark: "/book-preview-dark.jpg",
};

type Props = {
  images: (string | null | undefined)[];
  bookColor: BookColor | null;
};

export function BookAccordionPreview({ images, bookColor }: Props) {
  const bookSrc = bookColor ? BOOK_IMAGES[bookColor] : BOOK_IMAGES.light;

  return (
    <div className="relative w-full select-none" style={{ userSelect: "none" }}>
      {/* Base book image */}
      <img
        src={bookSrc}
        alt=""
        className="w-full object-contain"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Overlay user images into pockets */}
      {POCKETS.map((pocket, i) => {
        const src = images[i];
        return (
          <div
            key={i}
            className="absolute overflow-hidden"
            style={{
              left: pocket.left,
              top: pocket.top,
              width: pocket.width,
              paddingTop: pocket.height,
              transform: `rotate(${pocket.rotate}) skewY(${pocket.skewY})`,
              transformOrigin: "center center",
            }}
          >
            {src ? (
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <div className="absolute inset-0 bg-[#e8e3db]/50" />
            )}
          </div>
        );
      })}
    </div>
  );
}
