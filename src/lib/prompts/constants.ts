function envPrompt(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

const DEFAULT_BLACK_AND_WHITE_PROMPT = `Transform this photo into a black and white only stencil style illustration. The person in this photo will receive the result as a gift, so it must look like them and match the original photo exactly - same framing, same crop, same scale, nothing cut off or faded, avoid adding shadows.
Style: The result should have high contrast and look like it was drawn by hand with black and white markers only - playful, clean and emotionally warm.
The final result includes only the main subject/s, background is replaced with pure white background. Avoid any color other than pure black and white.`;

export const BLACK_AND_WHITE_PROMPT = envPrompt(
  process.env.BLACK_AND_WHITE_PROMPT,
  DEFAULT_BLACK_AND_WHITE_PROMPT,
);

const DEFAULT_CARTOON_COLOR_PROMPT = `Transform this photo into a pen colored cartoon illustration. The person in this photo will receive the result as a gift, so it must look like them and match the original photo exactly — same framing, same crop, same scale, nothing cut off or faded.

Style: The result should look like it was drawn by hand with colored markers - playful, clean, and emotionally warm.

The final result includes only the main subject/s, background is replaced with pure white background.`;

export const CARTOON_COLOR_PROMPT = envPrompt(
  process.env.CARTOON_COLOR_PROMPT,
  DEFAULT_CARTOON_COLOR_PROMPT,
);

const DEFAULT_PENS_COLOR_PROMPT = `Transform this photo into a colored pencil drawing. The person in this photo will receive the result as a gift, so it must look like them and match the original photo exactly — same framing, same crop, same scale, nothing cut off or faded.
Style: vibrant pencil strokes, playful hand-drawn texture, colored outlines only, no black lines, no border, no vignette, no soft edges, no fading anywhere.
Background should be completely removed and replaced with pure white background.`;

/** Single colorful style (`pens`). Override via PENS_COLOR_PROMPT. */
export const PENS_COLOR_PROMPT = envPrompt(
  process.env.PENS_COLOR_PROMPT,
  DEFAULT_PENS_COLOR_PROMPT,
);

/** @deprecated Prefer PENS_COLOR_PROMPT; kept for StyleType "colorful" mapping. */
export const COLORFUL_BOOK_PROMPT = PENS_COLOR_PROMPT;

const DEFAULT_WATERCOLOR_COLOR_PROMPT = `Transform this photo into a watercolor illustration. The person in this photo will receive the result as a gift, so it must look like them and match the original photo exactly — same framing, same crop, same scale, nothing cut off or faded.
Style: ink outlines with hand-drawn feel, vibrant watercolor fills.
Background should be completely removed and replaced with pure white background.`;

export const WATERCOLOR_COLOR_PROMPT = envPrompt(
  process.env.WATERCOLOR_COLOR_PROMPT,
  DEFAULT_WATERCOLOR_COLOR_PROMPT,
);

const DEFAULT_PENCIL_COLOR_PROMPT = `Transform this photo into a colored pencil drawing. The person in this photo will receive the result as a gift, so it must look like them and match the original photo exactly — same framing, same crop, same scale, nothing cut off or faded.

Style: soft strokes, light hand-drawn texture, colored outlines only, no black lines, no border, no vignette, no soft edges, no fading anywhere.
Background should be completely removed and replaced with pure white background.`;

export const PENCIL_COLOR_PROMPT = envPrompt(
  process.env.PENCIL_COLOR_PROMPT,
  DEFAULT_PENCIL_COLOR_PROMPT,
);
