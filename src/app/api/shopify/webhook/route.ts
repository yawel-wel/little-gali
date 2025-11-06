import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createHmac } from "crypto";

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

export async function POST(request: NextRequest) {
  console.log("=== Shopify Webhook Received ===");

  try {
    // Get webhook secret
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("SHOPIFY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const hmacHeader = request.headers.get("X-Shopify-Hmac-SHA256");
    const topic = request.headers.get("X-Shopify-Topic");

    console.log("Webhook topic:", topic);
    console.log("HMAC header exists:", !!hmacHeader);

    if (!hmacHeader) {
      console.error("Missing HMAC header");
      return NextResponse.json(
        { error: "Missing HMAC header" },
        { status: 401 }
      );
    }

    // Get raw body for signature verification
    const bodyText = await request.text();
    console.log("Body received, length:", bodyText.length);

    // Verify signature
    const hash = createHmac("sha256", webhookSecret)
      .update(bodyText, "utf8")
      .digest("base64");

    if (hash !== hmacHeader) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("Webhook signature verified successfully");

    // Parse webhook data
    const webhookData = JSON.parse(bodyText);
    console.log("Webhook data parsed");

    // Only process orders/paid events
    if (topic !== "orders/paid") {
      console.log("Ignoring non-payment webhook:", topic);
      return NextResponse.json({ status: "ignored" });
    }

    console.log("Processing order payment webhook");
    console.log("Order ID:", webhookData.id);
    console.log("Order name:", webhookData.name);

    // Extract customer info
    const customerName =
      webhookData.customer?.first_name && webhookData.customer?.last_name
        ? `${webhookData.customer.first_name} ${webhookData.customer.last_name}`
        : webhookData.billing_address?.name || "לקוח";
    const customerEmail =
      webhookData.customer?.email || webhookData.contact_email;
    const customerPhone =
      webhookData.customer?.phone || webhookData.billing_address?.phone;

    console.log("Customer:", customerName, customerEmail, customerPhone);

    // Extract images from line items
    let imageUrls: string[] = [];
    let bookId: string | null = null;

    // Try to get from line item properties first
    if (webhookData.line_items && webhookData.line_items.length > 0) {
      const lineItem = webhookData.line_items[0];
      console.log("Line item properties:", lineItem.properties);

      if (lineItem.properties && Array.isArray(lineItem.properties)) {
        for (const prop of lineItem.properties) {
          if (prop.name && prop.name.startsWith("תמונה")) {
            imageUrls.push(prop.value);
          }
        }
      }
    }

    // Try to get from note attributes
    if (
      webhookData.note_attributes &&
      Array.isArray(webhookData.note_attributes)
    ) {
      console.log("Note attributes:", webhookData.note_attributes);

      for (const attr of webhookData.note_attributes) {
        if (attr.name === "book_id") {
          bookId = attr.value;
        } else if (attr.name && attr.name.startsWith("image_")) {
          imageUrls.push(attr.value);
        }
      }
    }

    // Also check cart attributes if available
    if (webhookData.line_items && webhookData.line_items.length > 0) {
      const lineItem = webhookData.line_items[0];
      if (lineItem.properties && Array.isArray(lineItem.properties)) {
        for (const prop of lineItem.properties) {
          if (prop.name === "book_id") {
            bookId = prop.value;
          } else if (prop.name && prop.name.startsWith("image_")) {
            imageUrls.push(prop.value);
          }
        }
      }
    }

    console.log("Extracted images:", imageUrls.length);
    console.log("Book ID:", bookId);

    if (imageUrls.length === 0) {
      console.error("No images found in order");
      return NextResponse.json({ error: "No images found" }, { status: 400 });
    }

    // Send email with images
    console.log("Sending email notification...");

    let emailBody = `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>🎉 הזמנה חדשה שולמה!</h2>
        <p><strong>מספר הזמנה בשופיפיי:</strong> ${escapeHtml(
          webhookData.name
        )}</p>
        <p><strong>שם לקוח:</strong> ${escapeHtml(customerName)}</p>
        ${
          customerEmail
            ? `<p><strong>אימייל:</strong> ${escapeHtml(customerEmail)}</p>`
            : ""
        }
        ${
          customerPhone
            ? `<p><strong>טלפון:</strong> ${escapeHtml(customerPhone)}</p>`
            : ""
        }
        ${
          bookId
            ? `<p><strong>מזהה ספר:</strong> ${escapeHtml(bookId)}</p>`
            : ""
        }
        <hr/>
        <h3>התמונות להדפסה:</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
    `;

    imageUrls.forEach((url, index) => {
      emailBody += `
        <div style="margin: 10px;">
          <p><strong>תמונה ${index + 1}:</strong></p>
          <img src="${escapeHtml(url)}" alt="תמונה ${
        index + 1
      }" style="max-width: 200px; border: 2px solid #f97316; border-radius: 8px;"/>
          <br/>
          <a href="${escapeHtml(url)}" target="_blank">פתיחת תמונה בגודל מלא</a>
        </div>
      `;
    });

    emailBody += `
        </div>
      </div>
    `;

    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: "Little Gali <onboarding@resend.dev>",
      to: ["yaelromashkano@gmail.com"],
      subject: `💰 הזמנה חדשה שולמה - ${webhookData.name} - ${customerName}`,
      html: emailBody,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email notification" },
        { status: 500 }
      );
    }

    console.log("Email sent successfully");
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    console.error("Error stack:", error?.stack);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
