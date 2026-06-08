import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createHmac } from "crypto";
import {
  trackPurchaseCompleted,
  type ServerProductType,
} from "@/lib/analytics-server";

export const runtime = "nodejs";

function resolveOrderProductType(orderData: {
  line_items?: Array<{
    properties?: Array<{ name: string; value: string }>;
    properties_object?: Record<string, string>;
  }>;
}): ServerProductType {
  const lineItems = orderData.line_items ?? [];
  for (const item of lineItems) {
    const props = item.properties ?? [];
    const productTypeProp = props.find((p) => p.name === "_product_type");
    if (productTypeProp?.value === "framed_art") {
      return "frame";
    }
    if (item.properties_object?._product_type === "framed_art") {
      return "frame";
    }
  }
  return "booklet";
}

async function trackMixpanelPurchase(orderData: {
  total_price?: string;
  line_items?: Array<{
    properties?: Array<{ name: string; value: string }>;
    properties_object?: Record<string, string>;
  }>;
  name?: string;
  id?: string | number;
}) {
  const amount = parseFloat(orderData.total_price || "0");
  trackPurchaseCompleted({
    product_type: resolveOrderProductType(orderData),
    amount,
    order_id: String(orderData.name ?? orderData.id ?? ""),
  });
}

// Track purchase via Meta Conversions API
async function trackMetaPurchase(orderData: any) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn("Meta Pixel ID or Conversions API token not configured");
    return;
  }

  try {
    const eventTime = Math.floor(Date.now() / 1000);
    const customerEmail = orderData.customer?.email || orderData.contact_email;
    const customerPhone = orderData.customer?.phone || orderData.billing_address?.phone;
    const firstName = orderData.customer?.first_name || orderData.billing_address?.first_name;
    const lastName = orderData.customer?.last_name || orderData.billing_address?.last_name;
    const city = orderData.billing_address?.city;
    const country = orderData.billing_address?.country_code;
    const zip = orderData.billing_address?.zip;
    
    // Hash user data for privacy (Meta requirement)
    const hashData = (data: string) => {
      if (!data) return undefined;
      return createHmac("sha256", "")
        .update(data.toLowerCase().trim())
        .digest("hex");
    };

    const eventData = {
      event_name: "Purchase",
      event_time: eventTime,
      action_source: "website",
      event_source_url: "https://www.littlegali.com",
      user_data: {
        em: customerEmail ? hashData(customerEmail) : undefined,
        ph: customerPhone ? hashData(customerPhone) : undefined,
        fn: firstName ? hashData(firstName) : undefined,
        ln: lastName ? hashData(lastName) : undefined,
        country: country ? hashData(country) : undefined,
        ct: city ? hashData(city) : undefined,
        zp: zip ? hashData(zip) : undefined,
      },
      custom_data: {
        currency: orderData.currency || "ILS",
        value: parseFloat(orderData.total_price || "0"),
        content_type: "product",
        order_id: orderData.name || orderData.id,
        num_items: orderData.line_items?.length || 0,
      },
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [eventData],
          access_token: accessToken,
        }),
      }
    );

    const result = await response.json();
    
    if (response.ok) {
      console.log("Meta Purchase event tracked successfully:", result);
    } else {
      console.error("Failed to track Meta Purchase event:", result);
    }
  } catch (error) {
    console.error("Error tracking Meta Purchase event:", error);
  }
}

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

    // Track purchase with Meta Conversions API and Mixpanel
    await trackMetaPurchase(webhookData);
    await trackMixpanelPurchase(webhookData);

    console.log("Purchase tracked successfully");
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
