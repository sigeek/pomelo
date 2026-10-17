// Helpers for the <a1>…</a3> tags the AI intern puts around phrases that come from answer N.
import type { AnswerNumber } from "./schema";

export type Segment = { text: string; n?: AnswerNumber };

/** Remove every tag. Use for anything copied or sent to the lesson. */
export function stripTags(text: string): string {
  return text.replace(/<\/?a[1-3]>/g, "").replace(/[ \t]{2,}/g, " ").trim();
}

/**
 * Split text into plain and tagged segments. Returns null if the tags are malformed
 * (nested, unclosed, mismatched or any other markup), so the caller renders plain text.
 */
export function parseTags(text: string): Segment[] | null {
  const segments: Segment[] = [];
  const re = /<a([1-3])>([\s\S]*?)<\/a\1>/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index) });
    segments.push({ text: match[2], n: Number(match[1]) as AnswerNumber });
    last = re.lastIndex;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  // Leftover tag-like markup anywhere means the output was malformed.
  if (segments.some((s) => /<\/?[a-z][^>]*>/i.test(s.text))) return null;
  return segments;
}
