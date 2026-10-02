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

// Framed art has its own prompts so book previews are unaffected.
const DEFAULT_FRAMED_ART_PENCIL_PROMPT = `Redraw this exact photo as a realistic, fully rendered colored pencil portrait.

Keep everything from the photo the same: the same people, faces, expressions, poses, clothing, framing, crop and scale. Every person must stay clearly recognizable, with the same face shape, eyes, eyebrows, nose, mouth, hair and skin tone.

Drawing style: rich, layered colored pencil shading that fully fills every area of the subject. Show visible pencil grain and fine strokes, but the drawing reads as a finished, lifelike portrait, not a sketch. Colors match the photo closely: true warm skin tones with rosy cheeks and lips, hair in its real color and darkness, clothing in its real colors. Use soft colored edges instead of outlines, with no black ink lines.

Background: remove the original background completely, including floors, blankets, furniture and walls. The people sit on pure digital white (#FFFFFF): flat, bright and evenly white everywhere around them, with no paper tone, texture or shadow. Only the people (and any pets) from the photo appear in the image.`;

export const FRAMED_ART_PENCIL_PROMPT = envPrompt(
  process.env.FRAMED_ART_PENCIL_PROMPT,
  DEFAULT_FRAMED_ART_PENCIL_PROMPT,
);

const DEFAULT_FRAMED_ART_WATERCOLOR_PROMPT = `Transform this photo into a painted watercolor illustration. The person in this photo will receive the result as a gift, so it must look like them and match the original photo exactly: same framing, same crop, same scale, nothing cut off or faded.
Style: a rich, polished watercolor painting where color does all the work. Every part of the subject — skin, hair, clothing and accessories — is filled with dense, smooth, layered watercolor in vivid, saturated colors true to the photo, with no white paper showing through inside the subject. Skin is smooth and softly blended in warm, natural tones, flattering and gentle. Shapes and features are defined by color and soft shading, not by lines. Thin colored-pencil lines appear only subtly along the outer edges and for the finest details such as eyelashes and a few hair strands — no sketch lines, hatching or pencil texture anywhere else, and no black lines. Every edge of the subject is crisp and complete: no border, no vignette, no soft edges, no fading anywhere.
Background should be completely removed and replaced with pure white background.`;

export const FRAMED_ART_WATERCOLOR_PROMPT = envPrompt(
  process.env.FRAMED_ART_WATERCOLOR_PROMPT,
  DEFAULT_FRAMED_ART_WATERCOLOR_PROMPT,
);
