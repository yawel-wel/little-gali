const BASIC_SYSTEM_INSTRUCTION = `Do not reconstruct, complete, or invent faces, heads, or bodies.
Do not change pose, angle, or orientation.
Do not beautify, symmetrize, or idealize faces.
Copy visible shapes and proportions exactly; cropped boundaries stay cropped.
Do not infer missing geometry or add features.
Preserve expressions, distortions, and perspective.
Match iris color to the source photo.
Preserve hairline and density; do not fill thinning hair or bald areas.
Remove background; output solid white #FFFFFF.
Bottom edge is a hard horizontal crop, not feathered or sticker-shaped.`;

const BW_SYSTEM_INSTRUCTION_SUPPLEMENT = `Variable marker-style line weight: thick outer silhouette, thin inner detail.
Strict binary palette: only #000000 and #FFFFFF.
No gray, stippling, or soft shadows.
Turn photo shadows into solid black or white negative space.
High-contrast clothing with alternating black/white fills.
Hair and facial hair: black volumes with white carved lines for flow and texture.
Sharp inked edges; no fuzzy sketch artifacts.`;

export function buildNanoBananaSystemInstructionText(
  isBlackAndWhite: boolean,
): string {
  if (!isBlackAndWhite) {
    return BASIC_SYSTEM_INSTRUCTION;
  }
  return `${BASIC_SYSTEM_INSTRUCTION}\n${BW_SYSTEM_INSTRUCTION_SUPPLEMENT}`;
}
