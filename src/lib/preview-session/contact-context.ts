import type { PreviewSession } from "./types";

export function buildPreviewContactMessage(session: PreviewSession): string {
  return `מזהה תצוגה מקדימה: ${session.id}`;
}

export function buildPreviewContactHtml(session: PreviewSession): string {
  return `<p><strong>מזהה תצוגה מקדימה:</strong> ${session.id}</p>`;
}
