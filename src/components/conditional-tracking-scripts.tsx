"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface ConditionalTrackingScriptsProps {
  metaPixelId: string;
}

export function ConditionalTrackingScripts({ metaPixelId }: ConditionalTrackingScriptsProps) {
  useEffect(() => {
    const handleConsentAccepted = () => {
      setHasConsent(true);
    };

    window.addEventListener("cookieConsentAccepted", handleConsentAccepted);
    return () => {
      window.removeEventListener("cookieConsentAccepted", handleConsentAccepted);
    };
  }, [metaPixelId]);

  const [hasConsent, setHasConsent] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("little-gali-cookie-consent") === "accepted";
    } catch {
      return false;
    }
  });

  // Only load scripts if consent is given
  if (!hasConsent) {
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
