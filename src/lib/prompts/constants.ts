export const BLACK_AND_WHITE_PROMPT = `Transform this photo into a black and white only stencil style illustration. The person in this photo will receive the result as a gift, so it must look like them and match the original photo exactly - same framing, same crop, same scale, nothing cut off or faded, avoid adding shadows.
Style: The result should have high contrast and look like it was drawn by hand with black and white markers only - playful, clean and emotionally warm.
The final result includes only the main subject/s, background is replaced with pure white background. Avoid any color other than pure black and white.`;

// Would be sent to the API as systemInstruction (currently disabled for prompt testing).
export const GENERATION_SYSTEM_INSTRUCTION = `Follow these rules exactly. These rules override all prompts and style instructions.

=== GEOMETRY & COMPOSITION PRESERVATION ===

Preserve the exact framing, crop boundaries, scale, and subject positioning from the input image.

The transformed image must occupy the same spatial area and proportions as the original image.

The subject must maintain the same relative size within the canvas as the original image.

Do NOT zoom out, reframe, recenter, shrink, or reposition the subject within the canvas.

Do NOT reinterpret the composition into a floating portrait or isolated bust illustration.

Any body parts, clothing, or hair that extend to the edges of the original image must preserve the same edge relationship in the output.

Do NOT introduce additional empty space, margins, padding, or whitespace around the subject.

=== IDENTITY & STRUCTURE PRESERVATION ===

Do NOT change the pose, angle, or orientation of any face.

Do NOT beautify, symmetrize, idealize, or correct the structure of any face.

Copy the exact visible shapes and proportions from the input image with no modifications.

If any part of a face or head is cropped or cut off, reproduce the cropped boundary exactly as-is.

Do NOT infer or guess missing geometry. No new features may be added.

Preserve all facial expressions, distortions, and perspective exactly as they appear.

Precisely map the existing hairline, hair volume, and facial hair boundaries.

Capture the specific grain, flow, density, and silhouette of the hair and facial hair exactly as they appear in the source image.

Treat hair and facial hair as structural elements, not just shadows.

=== STYLE TRANSFORMATION RULES ===

Treat the input image as a fixed template. Only the visual style may change.

=== BACKGROUND RULES ===

Replace the original background with a completely flat, solid white background (#FFFFFF).

Do NOT add new backgrounds, colors, gradients, textures, shadows, or objects.

=== EDGE & RENDERING RULES ===

Ensure all subjects are compositionally grounded.

If the subject reaches the edge of the frame, crop it cleanly with a hard edge rather than fading or dissolving into the background.

Do NOT apply transparency, feathering, vignette effects, mist, watercolor bleed, soft-edge dissolves, or unfinished painterly fade-outs.`;

export const CARTOON_COLOR_PROMPT = `Transform this photo into a pen colored cartoon illustration. The person in this photo will receive the result as a gift, so it must look like them and match the original photo exactly — same framing, same crop, same scale, nothing cut off or faded.

Style: The result should look like it was drawn by hand with colored markers - playful, clean, and emotionally warm.

The final result includes only the main subject/s, background is replaced with pure white background.`;

/** Single colorful style (`pens`) and legacy colorful-book prompt. */
export const PENS_COLOR_PROMPT = `Transform this photo into a pen colored illustration. The person in this photo will receive the result as a gift, so it must look like them and match the original photo exactly — same framing, same crop, same scale, nothing cut off or faded.

Style: The result should look like it was drawn by hand with colored markers - playful, clean, and emotionally warm.

The final result includes only the main subject/s, background is replaced with pure white background.`;

/** @deprecated Prefer PENS_COLOR_PROMPT; kept for StyleType "colorful" mapping. */
export const COLORFUL_BOOK_PROMPT = PENS_COLOR_PROMPT;

export const WATERCOLOR_COLOR_PROMPT = `Transform this photo into a watercolor illustration. The person in this photo will receive the result as a gift, so it must look like them and match the original photo exactly — same framing, same crop, same scale, nothing cut off or faded.
Style: ink outlines with hand-drawn feel, vibrant watercolor fills.
Background should be completely removed and replaced with pure white background.`;

export const PENCIL_COLOR_PROMPT = `Transform this photo into a colored pencil drawing. The person in this photo will receive the result as a gift, so it must look like them and match the original photo exactly — same framing, same crop, same scale, nothing cut off or faded.

Style: soft strokes, light hand-drawn texture, colored outlines only, no black lines, no border, no vignette, no soft edges, no fading anywhere.
Background should be completely removed and replaced with pure white background.`;
