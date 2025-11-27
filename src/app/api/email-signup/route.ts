import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend only when API key is available
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
};

// Simple HTML escape function to prevent XSS
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: "כתובת אימייל נדרשת" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "כתובת אימייל לא תקינה" },
        { status: 400 }
      );
    }

    // Send email using Resend
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: "Little Gali <onboarding@resend.dev>",
      to: ["yaelromashkano@gmail.com"],
      replyTo: email,
      subject: `הרשמה לעדכונים - ספרוני בד - ${escapeHtml(email)}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #E5543D;">הרשמה חדשה לעדכונים - ספרוני בד</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>אימייל:</strong> ${escapeHtml(email)}</p>
            <p><strong>תאריך:</strong> ${new Date().toLocaleString("he-IL")}</p>
          </div>
        </div>
      `,
      text: `
הרשמה חדשה לעדכונים - ספרוני בד
אימייל: ${email}
תאריך: ${new Date().toLocaleString("he-IL")}
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "שגיאה בשליחת ההודעה. אנא נסה שוב מאוחר יותר." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email signup error:", error);
    return NextResponse.json(
      { error: "שגיאה בשרת. אנא נסה שוב מאוחר יותר." },
      { status: 500 }
    );
  }
}

