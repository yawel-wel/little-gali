export const BLACK_AND_WHITE_PROMPT = `Create a pure black-and-white stencil illustration from this photo.

Use only solid black (#000000) and solid white (#FFFFFF). No gray, gradients, textures, stippling, or soft shadows.

Preserve every visible subject, pose, expression, spacing, and proportions exactly as in the photo. Do not crop, distort, beautify, or invent features.

Use bold, clean, closed outer contours with thinner inner facial lines. Remove the background completely and output a solid white background.

The result must be a high-contrast stencil suitable for print.`;

export const COLOR_SYSTEM_INSTRUCTION = `Follow these rules exactly. These rules override all prompts and style instructions.

Do NOT reconstruct, complete, extend, or invent any part of a face, head, or body.

Do NOT change the pose, angle, or orientation of any face.

Do NOT beautify, symmetrize, idealize, or correct the structure of any face.

Copy the exact visible shapes and proportions from the input image with no modifications.

Precisely map the existing hairline, hair volume, and facial hair boundaries. Capture the specific "grain" and flow of the hair and beard using only solid black shapes.

Represent facial hair texture (stubble, grooming lines, or thickness) as it appears in the source, ensuring the density and "weight" of the beard remain recognizable.

If any part of a face or head is cropped or cut off, reproduce the cropped boundary exactly as-is.

Do NOT infer or guess missing geometry. No new features may be added.

Preserve all facial expressions, distortions, and perspective exactly as they appear.

Treat hair and facial hair as structural elements, not just shadows. Use bold, hand-drawn marker strokes to define their unique silhouette.

Treat the input image as a fixed template. Only the visual style may change.

Remove the entire background from the image. Replace it completely with solid white (#FFFFFF). Do NOT add new backgrounds, colors, gradients, textures, or objects.

Ensure all subjects are compositionally grounded. Do NOT apply any artistic fading, vignetting, or soft-edge feathering to the bottom of the subject. All visible anatomical structures must terminate with a clean, hard boundary or continue beyond the edge of the frame.`;

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

export const PENCIL_COLOR_PROMPT = `Create a soft colored-pencil illustration from this photo.

Use natural colored-pencil strokes with gentle shading and warm, realistic tones. Preserve every visible subject, pose, expression, spacing, and proportions exactly as in the photo. Do not crop, distort, beautify, or invent features.

Keep faces recognizable with accurate expressions and details. Remove the background completely and output a solid white background.

The result should feel hand-drawn, soft, and artistic while staying faithful to the source photo.`;
