export const BLACK_AND_WHITE_PROMPT = `Convert the given photo into a black and white only stencil style sketch illustration on a white background.
The result should have a high contrast.
Keep all proportions, facial features, hair, facial hair, and expressions accurate and recognizable.
Replace the background with clean white.
Avoid harsh shadows, gradients, or photographic details.
The result should look like it was drawn by hand with black and white markers only — playful, clean and emotionally warm.
Avoid any color other than pure black and white.
Avoid filling lips with black, they should always be white with black outlines.`;

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

export const CARTOON_COLOR_PROMPT = `Convert the given photo into a colored cartoon illustration on a white background.
Use vibrant pen strokes and keep the main subject's proportions and features accurate and recognizable.
Outline all shapes gently using colored or black lines.
Replace the background with clean white, but maintain the exact framing and composition of the input photo — the subject should occupy the same position and scale as in the original.
Do not shrink the subject, add empty space around them, or reframe the crop.
Avoid shadows, textures, gradients, or photographic details.
The result should look like it was drawn by hand with colored markers — playful, clean, and emotionally warm.
Hard edges throughout — no vignette, no fade, no gradual disappearance at the borders of the subject.`;

export const WATERCOLOR_COLOR_PROMPT = `Convert the given photo into an ink outline illustration with visible hand-drawn wobble, and vibrant watercolor-style fills with soft color bleeding on a white background.
Keep all proportions, facial features, and expressions accurate and recognizable.
Maintain the exact framing and composition of the input photo — the subject should occupy the same position and scale as in the original. Do not shrink the subject, add empty space around them, or reframe the crop.
Replace the background with pure clean white, keeping the subject anchored in the same position as the original — do not float or center the subject on the white background.
Avoid photographic details, heavy shadows, or gradients in the background.
Hard edges where the subject meets the background — no vignette, no fade, no gradual disappearance at the borders.
The result should look like a hand-painted watercolor character illustration — warm, vibrant, and full of charm.`;

export const PENCIL_COLOR_PROMPT = `Convert the given photo into a colored pencil sketch illustration.
Use soft, pastel-like pencil strokes with light texture visible, but keep the main subject's proportions and features accurate, recognizable and with the exact same size as in the original image.
Outline all shapes gently using colored lines — no black outlines.
Remove the background and replace it with white.
The result should look like it was drawn by hand with colored pencils — playful, clean, and emotionally warm.
Match the exact composition of the input image. If the subject fills the frame in the input, it should fill the frame in the output.`;
