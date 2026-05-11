import type { PreviewSession } from "./types";

export function buildPreviewContactMessage(session: PreviewSession): string {
  const lines = [
    `מזהה תצוגה מקדימה: ${session.id}`,
    "",
    "תמונות מקור (חתוכות):",
  ];

  session.slots.forEach((slot, index) => {
    lines.push(`${index + 1}. ${slot.originalUrl}`);
  });

  lines.push("", "תוצאות שחור-לבן שנבחרו:");
  session.slots.forEach((slot, index) => {
    const active = slot.candidates.find(
      (candidate) => candidate.id === slot.activeCandidateId,
    );
    lines.push(
      `${index + 1}. ${active?.cleanUrl || active?.previewUrl || "לא זמין"}`,
    );
  });

  lines.push("", "הודעה:");
  return lines.join("\n");
}

export function buildPreviewContactHtml(session: PreviewSession): string {
  const originalItems = session.slots
    .map(
      (slot, index) =>
        `<li><a href="${slot.originalUrl}">מקור ${index + 1}</a><br/><img src="${slot.originalUrl}" alt="" width="120" /></li>`,
    )
    .join("");
  const generatedItems = session.slots
    .map((slot, index) => {
      const active = slot.candidates.find(
        (candidate) => candidate.id === slot.activeCandidateId,
      );
      const url = active?.cleanUrl || active?.previewUrl;
      if (!url) {
        return `<li>תוצאה ${index + 1}: לא זמינה</li>`;
      }
      return `<li><a href="${url}">שחור-לבן ${index + 1}</a><br/><img src="${url}" alt="" width="120" /></li>`;
    })
    .join("");

  return `
    <p><strong>מזהה תצוגה מקדימה:</strong> ${session.id}</p>
    <p><strong>תמונות מקור</strong></p>
    <ul>${originalItems}</ul>
    <p><strong>תוצאות שחור-לבן שנבחרו</strong></p>
    <ul>${generatedItems}</ul>
  `;
}
