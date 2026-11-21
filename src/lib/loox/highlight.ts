export interface HighlightParts {
  before: string;
  match: string;
  after: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Finds the AI highlight inside the review text. Loox's highlight can differ from the
 * text in spacing (double spaces, line breaks), so words may be separated by any whitespace.
 * Returns null when it isn't found: the card then shows the plain text.
 */
export function splitOnHighlight(
  text: string,
  highlight: string | undefined,
): HighlightParts | null {
  const words = highlight?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length === 0) return null;

  const match = new RegExp(words.map(escapeRegExp).join("\\s+")).exec(text);
  if (!match) return null;

  return {
    before: text.slice(0, match.index),
    match: match[0],
    after: text.slice(match.index + match[0].length),
  };
}
