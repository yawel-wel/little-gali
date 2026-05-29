import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildContactEmailAttachments } from "@/lib/contact-attachments";
import {
  CONTACT_ATTACHMENT_MAX_FILES,
  validateContactAttachments,
} from "@/lib/contact-attachment-rules";

const ATTACHMENT_ERROR_MESSAGES: Record<string, string> = {
  "contact.attachmentsTooMany": `ניתן לצרף עד ${CONTACT_ATTACHMENT_MAX_FILES} תמונות בלבד`,
  "contact.attachmentsInvalidType": "ניתן לצרף קבצי JPG או PNG בלבד",
  "contact.attachmentsFileTooLarge": "גודל מקסימלי לכל תמונה: 2MB",
  "contact.attachmentsTotalTooLarge": "גודל מקסימלי לכל התמונות יחד: 10MB",
};
import {
  buildPreviewContactHtml,
  buildPreviewContactMessage,
} from "@/lib/preview-session/contact-context";
import { requirePreviewSession } from "@/lib/preview-session/auth";

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
};

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function readFormField(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let name = "";
    let email = "";
    let message = "";
    let previewSessionId: string | undefined;
    let secondaryPreviewSessionId: string | undefined;
    let attachmentFiles: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = readFormField(formData.get("name"));
      email = readFormField(formData.get("email"));
      message = readFormField(formData.get("message"));
      const sessionField = readFormField(formData.get("previewSessionId"));
      previewSessionId = sessionField || undefined;
      const secondaryField = readFormField(
        formData.get("secondaryPreviewSessionId"),
      );
      secondaryPreviewSessionId = secondaryField || undefined;
      attachmentFiles = formData
        .getAll("images")
        .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    } else {
      const body = (await request.json()) as {
        name?: string;
        email?: string;
        message?: string;
        previewSessionId?: string;
        secondaryPreviewSessionId?: string;
      };
      name = body.name?.trim() ?? "";
      email = body.email?.trim() ?? "";
      message = body.message?.trim() ?? "";
      previewSessionId = body.previewSessionId?.trim() || undefined;
      secondaryPreviewSessionId =
        body.secondaryPreviewSessionId?.trim() || undefined;
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "כתובת אימייל לא תקינה" },
        { status: 400 },
      );
    }

    if (attachmentFiles.length > 0 && !previewSessionId) {
      return NextResponse.json(
        { error: "ניתן לצרף תמונות רק מהודעה הקשורה לתצוגה מקדימה" },
        { status: 400 },
      );
    }

    const attachmentValidation = validateContactAttachments(attachmentFiles);
    if (!attachmentValidation.ok) {
      return NextResponse.json(
        {
          error:
            ATTACHMENT_ERROR_MESSAGES[attachmentValidation.errorKey] ??
            "שגיאה בקבצים המצורפים",
        },
        { status: 400 },
      );
    }

    let previewHtml = "";
    let previewText = "";
    const previewSessionIds = [
      previewSessionId,
      secondaryPreviewSessionId,
    ].filter((id): id is string => Boolean(id?.trim()));

    for (const sessionId of previewSessionIds) {
      const auth = await requirePreviewSession(sessionId);
      if (!(auth instanceof NextResponse)) {
        previewHtml += buildPreviewContactHtml(auth.session);
        previewText += `\n\n${buildPreviewContactMessage(auth.session)}`;
      } else {
        previewHtml += `<p><strong>מזהה תצוגה מקדימה:</strong> ${escapeHtml(sessionId)}</p>`;
        previewText += `\n\nמזהה תצוגה מקדימה: ${sessionId}`;
      }
    }

    const attachments =
      attachmentFiles.length > 0
        ? await buildContactEmailAttachments(attachmentFiles)
        : undefined;

    const attachmentNote =
      attachments && attachments.length > 0
        ? `<p><strong>קבצים מצורפים:</strong> ${attachments.length} תמונה/ות</p>`
        : "";

    const attachmentText =
      attachments && attachments.length > 0
        ? `\n\nקבצים מצורפים: ${attachments.length}`
        : "";

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "Little Gali <onboarding@resend.dev>",
      to: ["yaelromashkano@gmail.com"],
      replyTo: email,
      subject: `הודעה חדשה מאתר ליטל גלי - ${escapeHtml(name)}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #E5543D;">הודעה חדשה מאתר ליטל גלי</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>שם:</strong> ${escapeHtml(name)}</p>
            <p><strong>אימייל:</strong> ${escapeHtml(email)}</p>
            <p><strong>תוכן ההודעה:</strong></p>
            <p style="white-space: pre-wrap; margin-top: 10px;">${escapeHtml(message)}</p>
            ${attachmentNote}
            ${previewHtml}
          </div>
        </div>
      `,
      text: `
שם: ${name}
אימייל: ${email}
תוכן ההודעה:
${message}${attachmentText}${previewText}
      `,
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "שגיאה בשליחת ההודעה. אנא נסה שוב מאוחר יותר." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "ההודעה נשלחה בהצלחה!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "שגיאה בשרת. אנא נסה שוב מאוחר יותר." },
      { status: 500 },
    );
  }
}
