import type { PreviewSession } from "./types";

export const INITIAL_CHANGE_CREDITS = 3;

export function hasChangeCredits(session: PreviewSession): boolean {
  return session.changeCreditsRemaining > 0;
}

export function consumeChangeCredit(session: PreviewSession): void {
  if (session.changeCreditsRemaining <= 0) {
    throw new Error("No change credits remaining");
  }
  session.changeCreditsRemaining -= 1;
}
