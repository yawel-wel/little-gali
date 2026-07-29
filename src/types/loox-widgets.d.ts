import type { HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "loox-dynamic-carousel-widget": HTMLAttributes<HTMLElement> & {
        "data-widget"?: string;
        "show-review-text"?: string;
      };
      "loox-snippets-widget": HTMLAttributes<HTMLElement> & {
        "product-id"?: string;
        "review-count"?: string;
      };
      "loox-video-slider-widget": HTMLAttributes<HTMLElement> & {
        "show-rating"?: string;
        "show-reviewer-name"?: string;
        "hide-arrows-mobile"?: string;
        "auto-play"?: string;
      };
    }
  }
}

export {};
