import { cookies } from "next/headers";
import {
  FRAMED_ART_SESSION_COOKIE,
  verifyFramedArtSessionCookie,
} from "@/lib/framed-art/cookies";
import {
  PREVIEW_SESSION_COOKIE,
  verifyPreviewSessionCookie,
} from "./cookies";
import { loadPreviewSession } from "./store";
import type { PreviewSession } from "./types";

export type PreviewLoadFailureReason =
  | "cookie_missing"
  | "cookie_invalid"
  | "cookie_mismatch"
  | "cookie_cleared_by_framed_art"
  | "session_not_found"
  | "initialization_error"
  | "http_error"
  | "unknown";

export type PreviewLoadFailureDiagnosis = {
  reason: PreviewLoadFailureReason;
  headline: string;
  explanation: string;
  technicalLines: string[];
};

type DiagnoseInput = {
  sessionId: string;
  status?: number;
  clientDetail?: string;
};

function cookiePreviewId(raw: string | undefined): string | null {
  return verifyPreviewSessionCookie(raw);
}

async function readCookieSnapshot(): Promise<{
  previewRaw: string | undefined;
  previewSessionId: string | null;
  framedArtSessionId: string | null;
}> {
  const store = await cookies();
  const previewRaw = store.get(PREVIEW_SESSION_COOKIE)?.value;
  const framedRaw = store.get(FRAMED_ART_SESSION_COOKIE)?.value;
  return {
    previewRaw,
    previewSessionId: cookiePreviewId(previewRaw),
    framedArtSessionId: verifyFramedArtSessionCookie(framedRaw),
  };
}

function sessionSummaryLines(session: PreviewSession | null): string[] {
  if (!session) {
    return ["סשן ב-KV: לא נמצא (פג תוקף אחרי 7 ימים, או מזהה שלא נוצר)"];
  }
  return [
    `סשן ב-KV: קיים`,
    `שלב: ${session.phase}`,
    `סטטוס יצירה: ${session.generationStatus}`,
    `סוג ספר: ${session.bookFlow ?? "classic"}`,
    session.initializationError
      ? `שגיאת אתחול: ${session.initializationError}`
      : "שגיאת אתחול: אין",
  ];
}

function diagnoseForbidden(input: {
  sessionId: string;
  previewRaw: string | undefined;
  previewSessionId: string | null;
  framedArtSessionId: string | null;
  session: PreviewSession | null;
}): PreviewLoadFailureDiagnosis {
  const {
    sessionId,
    previewRaw,
    previewSessionId,
    framedArtSessionId,
    session,
  } = input;
  const technicalLines = [
    `מזהה בכתובת: ${sessionId}`,
    previewSessionId
      ? `עוגיית preview_session: ${previewSessionId}`
      : previewRaw
        ? "עוגיית preview_session: קיימת אבל החתימה לא תקינה"
        : "עוגיית preview_session: חסרה",
    framedArtSessionId
      ? `עוגיית framed_art_session: ${framedArtSessionId}`
      : "עוגיית framed_art_session: אין",
    ...sessionSummaryLines(session),
  ];

  if (previewRaw && !previewSessionId) {
    return {
      reason: "cookie_invalid",
      headline: "עוגיית התצוגה המקדימה פגומה",
      explanation:
        "בדפדפן יש עוגיית preview_session, אבל החתימה שלה לא תקינה. זה יכול לקרות אחרי שינוי סוד החתימה בשרת, או אם העוגיה נחתכה/הושחתה.",
      technicalLines,
    };
  }

  if (
    !previewSessionId &&
    framedArtSessionId &&
    framedArtSessionId !== sessionId
  ) {
    return {
      reason: "cookie_cleared_by_framed_art",
      headline: "עוגיית הספר נמחקה אחרי תמונה ממוסגרת",
      explanation:
        "אין עוגיית ספר, אבל יש עוגיית תמונה ממוסגרת. יצירת תצוגה של framed art מוחקת במכוון את עוגיית הספר — לכן חזרה לקישור התצוגה המקדימה של הספר נחסמת מדפדפן זה.",
      technicalLines,
    };
  }

  if (previewSessionId && previewSessionId !== sessionId) {
    return {
      reason: "cookie_mismatch",
      headline: "הדפדפן משויך לתצוגה מקדימה אחרת",
      explanation:
        "העוגיה בדפדפן שייכת לסשן אחר. בדרך כלל המשתמש התחיל תצוגה מקדימה חדשה (העוגיה נדרסת כי נשמר סשן אחד בלבד), ואז חזר בקישור/היסטוריה לסשן הישן.",
      technicalLines,
    };
  }

  return {
    reason: "cookie_missing",
    headline: "אין גישה מהדפדפן הזה (חסרה עוגייה)",
    explanation:
      "אין עוגיית preview_session שתואמת את הקישור. זה קורה כשפותחים את הקישור במכשיר או דפדפן אחר, אחרי מחיקת עוגיות / גלישה בסתר, בדפדפן פנימי של וואטסאפ/אינסטגרם, או כשמשתפים את קישור התצוגה המקדימה עם מישהו אחר.",
    technicalLines,
  };
}

export async function diagnosePreviewLoadFailure(
  input: DiagnoseInput,
): Promise<PreviewLoadFailureDiagnosis> {
  const { sessionId, status, clientDetail } = input;
  const { previewRaw, previewSessionId, framedArtSessionId } =
    await readCookieSnapshot();
  const session = await loadPreviewSession(sessionId);

  if (status === 403) {
    return diagnoseForbidden({
      sessionId,
      previewRaw,
      previewSessionId,
      framedArtSessionId,
      session,
    });
  }

  if (status === 404) {
    return {
      reason: "session_not_found",
      headline: "הסשן לא נמצא",
      explanation:
        "השרת לא מצא את הסשן ב-KV. בדרך כלל עברו יותר מ-7 ימים (תוקף הסשן), או שהמזהה בכתובת לא קיים.",
      technicalLines: [
        `מזהה בכתובת: ${sessionId}`,
        previewSessionId
          ? `עוגיית preview_session: ${previewSessionId}`
          : "עוגיית preview_session: חסרה",
        ...sessionSummaryLines(session),
      ],
    };
  }

  if (!status && (session?.initializationError || clientDetail)) {
    return {
      reason: "initialization_error",
      headline: "יצירת התצוגה המקדימה נכשלה",
      explanation:
        "הדפדפן הצליח לגשת לסשן, אבל יצירת התמונות נכשלה או לא הושלמה. זה כבר לא בעיית הרשאה — כדאי לבדוק את שגיאת האתחול ואת סטטוס היצירה.",
      technicalLines: [
        `מזהה בכתובת: ${sessionId}`,
        ...sessionSummaryLines(session),
        clientDetail ? `הודעה מהלקוח: ${clientDetail}` : "",
      ].filter(Boolean),
    };
  }

  if (typeof status === "number") {
    return {
      reason: "http_error",
      headline: `שגיאת טעינה (${status})`,
      explanation:
        "טעינת התצוגה המקדימה נכשלה עם קוד HTTP שלא מזוהה כבעיית הרשאה או סשן חסר.",
      technicalLines: [
        `מזהה בכתובת: ${sessionId}`,
        `קוד HTTP: ${status}`,
        ...sessionSummaryLines(session),
        clientDetail ? `הודעה מהלקוח: ${clientDetail}` : "",
      ].filter(Boolean),
    };
  }

  return {
    reason: "unknown",
    headline: "טעינת התצוגה המקדימה נכשלה",
    explanation: "לא היה מספיק מידע כדי לסווג את השגיאה אוטומטית.",
    technicalLines: [
      `מזהה בכתובת: ${sessionId}`,
      ...sessionSummaryLines(session),
      clientDetail ? `הודעה מהלקוח: ${clientDetail}` : "",
    ].filter(Boolean),
  };
}
