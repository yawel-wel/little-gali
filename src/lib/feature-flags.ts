export function isAiPreviewEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_PREVIEW_ENABLED === "true";
}
