import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      detail?: string;
      status?: number;
    };
    const sessionId = body.sessionId?.trim();
    const detail = body.detail?.trim() || "לא צוין פירוט נוסף";
    const status =
      typeof body.status === "number" ? String(body.status) : "לא ידוע";

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "Little Gali <onboarding@resend.dev>",
      to: ["yaelromashkano@gmail.com"],
      subject: "תצוגה מקדימה נכשלה - Little Gali",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #E5543D;">התצוגה המקדימה נכשלה</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>מזהה סשן:</strong> ${escapeHtml(sessionId)}</p>
            <p><strong>קוד שגיאה:</strong> ${escapeHtml(status)}</p>
            <p><strong>פירוט:</strong></p>
            <p style="white-space: pre-wrap; margin-top: 10px;">${escapeHtml(detail)}</p>
          </div>
        </div>
      `,
      text: `התצוגה המקדימה נכשלה\nמזהה סשן: ${sessionId}\nקוד שגיאה: ${status}\nפירוט: ${detail}`,
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
