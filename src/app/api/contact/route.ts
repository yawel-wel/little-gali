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
    const { name, email, message } = body;

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });
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
      subject: `הודעה חדשה מאתר ליטל גלי - ${escapeHtml(name)}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #E5543D;">הודעה חדשה מאתר ליטל גלי</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>שם:</strong> ${escapeHtml(name)}</p>
            <p><strong>אימייל:</strong> ${escapeHtml(email)}</p>
            <p><strong>תוכן ההודעה:</strong></p>
            <p style="white-space: pre-wrap; margin-top: 10px;">${escapeHtml(
              message
            )}</p>
          </div>
        </div>
      `,
      text: `
שם: ${name}
אימייל: ${email}
תוכן ההודעה:
${message}
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
      { success: true, message: "ההודעה נשלחה בהצלחה!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "שגיאה בשרת. אנא נסה שוב מאוחר יותר." },
      { status: 500 }
    );
  }
}
