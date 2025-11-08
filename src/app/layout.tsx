import type { Metadata } from "next";
import { Assistant, Heebo } from "next/font/google";
import "./globals.css";
import { UploadImagesProvider } from "@/lib/UploadImagesContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  weight: ["700"],
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Little Gali",
  description:
    "מתנה אישית וקסומה להולדת התינוק – ספרון בעיצוב ייחודי עם תמונות של המשפחה, צד שחור-לבן וצד צבעוני. מזכרת מרגשת לשנים הראשונות של החיים.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="overflow-x-hidden">
      <head>
        <meta
          name="google-site-verification"
          content="Fy9eAB6H8N1DkO006a1eYCRc99aOjEioAiBJDNLRZZ4"
        />
      </head>
      <body
        className={`${heebo.variable} ${assistant.variable} antialiased overflow-x-hidden`}
      >
        <UploadImagesProvider>{children}</UploadImagesProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
