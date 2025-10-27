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

// Convert base64 to buffer for Resend attachments
function base64ToBuffer(base64String: string): {
  data: Buffer;
  filename: string;
} {
  // Remove data URL prefix if present (e.g., "data:image/png;base64,")
  const base64Data = base64String.includes(",")
    ? base64String.split(",")[1]
    : base64String;

  // Detect mime type and extension from base64 string
  let mimeType = "image/jpeg";
  let extension = "jpg";

  if (base64String.includes("data:image/png")) {
    mimeType = "image/png";
    extension = "png";
  } else if (
    base64String.includes("data:image/jpeg") ||
    base64String.includes("data:image/jpg")
  ) {
    mimeType = "image/jpeg";
    extension = "jpg";
  } else if (base64String.includes("data:image/gif")) {
    mimeType = "image/gif";
    extension = "gif";
  } else if (base64String.includes("data:image/webp")) {
    mimeType = "image/webp";
    extension = "webp";
  }

  const buffer = Buffer.from(base64Data, "base64");
  return { data: buffer, filename: `image.${extension}` };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phoneNumber, hearAbout, images } = body;

    // Validate input
    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !images ||
      !Array.isArray(images) ||
      images.length === 0
    ) {
      return NextResponse.json({ error: "שדות חובה חסרים" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "כתובת אימייל לא תקינה" },
        { status: 400 }
      );
    }

    // Prepare attachments from base64 images
    const attachments = images
      .slice(0, 5)
      .map((base64Image: string, index: number) => {
        const { data, filename } = base64ToBuffer(base64Image);
        return {
          filename: `image-${index + 1}-${Date.now()}.${
            filename.split(".")[1]
          }`,
          content: data,
        };
      });

    // Send email using Resend
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: "Little Gali <onboarding@resend.dev>",
      to: ["yaelromashkano@gmail.com"],
      subject: `הזמנה חדשה - ${escapeHtml(fullName)}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3eee8;">
          <h2 style="color: #E5543D; margin-bottom: 30px;">הזמנה חדשה - little gali</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #E5543D; margin-top: 0;">פרטי המזמין:</h3>
            <p style="margin: 10px 0;"><strong>שם מלא:</strong> ${escapeHtml(
              fullName
            )}</p>
            <p style="margin: 10px 0;"><strong>אימייל:</strong> ${escapeHtml(
              email
            )}</p>
            <p style="margin: 10px 0;"><strong>מספר טלפון:</strong> ${escapeHtml(
              phoneNumber
            )}</p>
          </div>

          ${
            hearAbout
              ? `
          <div style="background-color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #E5543D; margin-top: 0;">הערות:</h3>
            <p style="margin: 10px 0; white-space: pre-wrap;">${escapeHtml(
              hearAbout
            )}</p>
          </div>
          `
              : ""
          }

          <div style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #E5543D; margin-top: 0;">התמונות שנבחרו (${
              images.length
            } מתוך 5):</h3>
            <p style="color: #666; margin-bottom: 15px;">התמונות מצורפות להודעה - ניתן להוריד אותן מהקובץ המצורף</p>
          </div>
        </div>
      `,
      text: `
הזמנה חדשה - little gali

פרטי המזמין:
שם מלא: ${fullName}
אימייל: ${email}
מספר טלפון: ${phoneNumber}

${hearAbout ? `הערות:\n${hearAbout}\n` : ""}

התמונות שנבחרו (${images.length} מתוך 5) - מצורפות להודעה
      `,
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "שגיאה בשליחת ההזמנה. אנא נסה שוב מאוחר יותר." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "ההזמנה נשלחה בהצלחה!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order submission error:", error);
    return NextResponse.json(
      { error: "שגיאה בשרת. אנא נסה שוב מאוחר יותר." },
      { status: 500 }
    );
  }
}
