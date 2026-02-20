import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Assistant, Heebo } from "next/font/google";
import "./globals.css";
import { UploadImagesProvider } from "@/lib/UploadImagesContext";
import { CartProvider } from "@/lib/CartContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MuiThemeProvider } from "@/theme/MuiThemeProvider";
import { TopBanner } from "@/components/top-banner";
import { MetaPixelScript } from "@/components/meta-pixel";

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
  openGraph: {
    title: "Little Gali – ספרון אישי לתינוק שלך",
    description:
      "ספרון שחור־לבן וצבעוני בהתאמה אישית – חיזוק קשר, סקרנות והתפתחות מהחודשים הראשונים 💫",
    url: "https://www.littlegali.com",
    siteName: "Little Gali",
    images: [
      {
        url: "https://res.cloudinary.com/dysgpkvl4/image/upload/v1763613635/little-gali/gzqsbjh01tqeeqo7tkwp.jpg",
        width: 1200,
        height: 630,
        alt: "Little Gali Baby Book",
      },
    ],
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Little Gali – ספרון אישי לתינוק שלך",
    description:
      "ספרון שחור־לבן וצבעוני בהתאמה אישית – חיזוק קשר, סקרנות והתפתחות מהחודשים הראשונים 💫",
    images: [
      "https://res.cloudinary.com/dysgpkvl4/image/upload/v1763613635/little-gali/gzqsbjh01tqeeqo7tkwp.jpg",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
  
  return (
    <html
      lang="he"
      dir="rtl"
      suppressHydrationWarning
    >
      <head>
        <meta
          name="google-site-verification"
          content="Fy9eAB6H8N1DkO006a1eYCRc99aOjEioAiBJDNLRZZ4"
        />
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7NHYLBNE1J"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7NHYLBNE1J');
            `,
          }}
        />
        {/* Meta Pixel */}
        {metaPixelId && <MetaPixelScript pixelId={metaPixelId} />}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedLocale = localStorage.getItem('locale');
                  if (savedLocale === 'en' || savedLocale === 'he') {
                    document.documentElement.lang = savedLocale;
                    document.documentElement.dir = savedLocale === 'he' ? 'rtl' : 'ltr';
                    document.documentElement.setAttribute('data-locale', savedLocale);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            html:not([data-locale]) body {
              opacity: 0;
              visibility: hidden;
            }
            html[data-locale] body {
              opacity: 1;
              visibility: visible;
              transition: opacity 0.1s;
            }
          `,
          }}
        />
      </head>
      <body
        className={`${heebo.variable} ${assistant.variable} antialiased`}
        suppressHydrationWarning
      >
        <MuiThemeProvider>
          <LanguageProvider>
            <CartProvider>
              <UploadImagesProvider>
                <TopBanner />
                {children}
              </UploadImagesProvider>
            </CartProvider>
          </LanguageProvider>
        </MuiThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
