// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

try {
  const integrations: ReturnType<typeof Sentry.replayIntegration>[] = [];

  // Session Replay is heavy and can break some mobile browsers / blockers.
  if (
    typeof window !== "undefined" &&
    !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  ) {
    integrations.push(
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        mask: [".sentry-mask", "[data-sentry-mask]"],
        block: [".sentry-block", "[data-sentry-block]"],
      }),
    );
  }

  Sentry.init({
    dsn: "https://7ddf52a3620c62e3c71663a4015b27a3@o4511405882540032.ingest.de.sentry.io/4511405886668880",
    integrations,
    tracesSampleRate: 1,
    enableLogs: true,
    replaysSessionSampleRate: integrations.length > 0 ? 0.1 : 0,
    replaysOnErrorSampleRate: integrations.length > 0 ? 1.0 : 0,
    sendDefaultPii: true,
  });
} catch (error) {
  console.warn("Sentry client init skipped:", error);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
