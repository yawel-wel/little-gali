import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { diagnosePreviewLoadFailure } from "@/lib/preview-session/diagnose-load-failure";

export const runtime = "nodejs";

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (character) => map[character]);
}

function trimText(value: unknown, maxLength = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      detail?: string;
      status?: number;
      pageUrl?: string;
      referrer?: string;
    };
    const sessionId = body.sessionId?.trim();
    const clientDetail = trimText(body.detail, 1000) || "לא צוין פירוט נוסף";
    const status =
      typeof body.status === "number" ? String(body.status) : "לא ידוע";

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const diagnosis = await diagnosePreviewLoadFailure({
      sessionId,
      status: typeof body.status === "number" ? body.status : undefined,
      clientDetail,
    });

    const pageUrl = trimText(body.pageUrl) ?? request.headers.get("referer") ?? "";
    const referrer = trimText(body.referrer) ?? "";
    const userAgent = request.headers.get("user-agent") ?? "";

    const contextLines = [
      `סיבה: ${diagnosis.reason}`,
      `קוד שגיאה: ${status}`,
      pageUrl ? `כתובת הדף: ${pageUrl}` : "",
      referrer ? `דף קודם (referrer): ${referrer}` : "דף קודם (referrer): אין",
      userAgent ? `דפדפן: ${userAgent}` : "",
      `הודעה שהוצגה למשתמש: ${clientDetail}`,
    ].filter(Boolean);

    const text = [
      diagnosis.headline,
      "",
      diagnosis.explanation,
      "",
      "פרטים טכניים:",
      ...diagnosis.technicalLines.map((line) => `- ${line}`),
      "",
      "הקשר:",
      ...contextLines.map((line) => `- ${line}`),
    ].join("\n");

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "Little Gali <onboarding@resend.dev>",
      to: ["yaelromashkano@gmail.com"],
      subject: `${diagnosis.headline} - Little Gali`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #E5543D;">${escapeHtml(diagnosis.headline)}</h2>
          <p style="margin-top: 12px; line-height: 1.5;">${escapeHtml(diagnosis.explanation)}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>פרטים טכניים</strong></p>
            ${diagnosis.technicalLines
              .map((line) => `<p style="margin: 6px 0;">${escapeHtml(line)}</p>`)
              .join("")}
            <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
            <p><strong>הקשר</strong></p>
            ${contextLines
              .map((line) => `<p style="margin: 6px 0;">${escapeHtml(line)}</p>`)
              .join("")}
          </div>
        </div>
      `,
      text,
    });

    if (error) {
      console.error("Preview failure email error:", error);
      return NextResponse.json(
        { error: "Failed to send preview failure email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Preview failure report error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
