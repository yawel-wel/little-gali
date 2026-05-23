// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";

try {
  Sentry.init({
    dsn: "https://7ddf52a3620c62e3c71663a4015b27a3@o4511405882540032.ingest.de.sentry.io/4511405886668880",
    enabled: isProd,
    tracesSampleRate: isProd ? 0.15 : 0,
    enableLogs: isProd,
    sendDefaultPii: true,
  });
} catch (error) {
  console.warn("Sentry client init skipped:", error);
}

export const onRouterTransitionStart = isProd
  ? Sentry.captureRouterTransitionStart
  : () => {};
