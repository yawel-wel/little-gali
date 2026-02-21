"use client";

import { useEffect } from "react";
import Script from "next/script";

interface ConditionalTrackingScriptsProps {
  metaPixelId: string;
}

export function ConditionalTrackingScripts({ metaPixelId }: ConditionalTrackingScriptsProps) {
  useEffect(() => {
    const consent = localStorage.getItem("little-gali-cookie-consent");
    
    if (consent === "accepted") {
      // Initialize Google Analytics
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("js", new Date());
        (window as any).gtag("config", "G-7NHYLBNE1J");
      }

      // Initialize Meta Pixel
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("init", metaPixelId);
        (window as any).fbq("track", "PageView");
      }
    }

    // Listen for consent acceptance
    const handleConsentAccepted = () => {
      // Reload the page to load tracking scripts
      window.location.reload();
    };

    window.addEventListener("cookieConsentAccepted", handleConsentAccepted);
    return () => {
      window.removeEventListener("cookieConsentAccepted", handleConsentAccepted);
    };
  }, [metaPixelId]);

  // Check if consent is given
  const consent = typeof window !== "undefined" 
    ? localStorage.getItem("little-gali-cookie-consent")
    : null;

  // Only load scripts if consent is given
  if (consent !== "accepted") {
    return null;
  }

  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-7NHYLBNE1J"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-7NHYLBNE1J');
        `}
      </Script>

      {/* Meta Pixel */}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
