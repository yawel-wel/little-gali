import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

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

// TEMPORARY CHECKOUT FLOW API
// This endpoint sends order details via email for manual processing
// When removing this feature, delete this entire file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phoneNumber, books } = body;

    // Validate input
    if (!name || !phoneNumber || !books || !Array.isArray(books) || books.length === 0) {
      return NextResponse.json(
        { error: "שדות חובה חסרים" },
        { status: 400 }
      );
    }

    const totalBooks = books.reduce(
      (sum: number, book: { quantity: number }) => sum + (book.quantity || 1),
      0
    );

    // Build email HTML
    let booksHtml = "";
    books.forEach((book: any, index: number) => {
      const bookNumber = index + 1;
      const quantity = book.quantity || 1;
      const style = book.style === "cartoon" ? "קריקטורה" : book.style === "pencil" ? "עיפרון" : "קריקטורה";
      const imageLinks = book.imageUrls?.map((url: string) => escapeHtml(url)).join("<br>") || "אין תמונות";

      booksHtml += `
        <div style="background-color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #E5543D; margin-top: 0;">ספר ${bookNumber}:</h3>
          <p style="margin: 10px 0;"><strong>כמות:</strong> ${quantity}</p>
          <p style="margin: 10px 0;"><strong>סגנון צבעוני:</strong> ${style}</p>
          <p style="margin: 10px 0;"><strong>לינקים לתמונות:</strong></p>
          <div style="margin: 10px 0; padding: 10px; background-color: #f9f9f9; border-radius: 5px; word-break: break-all;">
            ${imageLinks}
          </div>
        </div>
      `;
    });

    // Send email using Resend
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: "Little Gali <onboarding@resend.dev>",
      to: ["yaelromashkano@gmail.com"],
      subject: `הזמנה חדשה - ${escapeHtml(name)}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3eee8;">
          <h2 style="color: #E5543D; margin-bottom: 30px;">הזמנה חדשה - little gali</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #E5543D; margin-top: 0;">פרטי המזמין:</h3>
            <p style="margin: 10px 0;"><strong>שם:</strong> ${escapeHtml(name)}</p>
            <p style="margin: 10px 0;"><strong>מספר טלפון:</strong> ${escapeHtml(phoneNumber)}</p>
            <p style="margin: 10px 0;"><strong>מספר ספרים:</strong> ${totalBooks}</p>
          </div>

          <h3 style="color: #E5543D; margin-bottom: 20px;">פרטי הספרים:</h3>
          ${booksHtml}
        </div>
      `,
      text: `
הזמנה חדשה - little gali

פרטי המזמין:
שם: ${name}
מספר טלפון: ${phoneNumber}
מספר ספרים: ${totalBooks}

פרטי הספרים:
${books
  .map(
    (book: any, index: number) => `
ספר ${index + 1}:
כמות: ${book.quantity || 1}
סגנון צבעוני: ${book.style === "cartoon" ? "קריקטורה" : book.style === "pencil" ? "עיפרון" : "קריקטורה"}
לינקים לתמונות:
${book.imageUrls?.join("\n") || "אין תמונות"}
`
  )
  .join("\n")}
      `,
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
    console.error("Temporary checkout error:", error);
    return NextResponse.json(
      { error: "שגיאה בשרת. אנא נסה שוב מאוחר יותר." },
      { status: 500 }
    );
  }
}

