/**
 * Pure Acrostic engine. This word puzzle shares NOTHING with the Quizzes engine —
 * no found-set, no timer. A clue is solved when the normalized guess equals the
 * clue's normalized answer (case- and space-insensitive). The hidden quote is
 * revealed PROGRESSIVELY: while solving, words are masked; each solved clue lifts
 * the mask on its share of the quote's words, so reveal = f(solved/total). Fully
 * solved ⇒ the whole quote shows. All pure + deterministic → unit-tested without
 * React or AWS.
 */

/** Case/space/punctuation-insensitive normalization for answer matching. */
export function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export interface Clue {
  clue: string;
  answer: string;
}

/** Does a guess match a clue's answer (normalized)? */
export function matchesAnswer(guess: string, answer: string): boolean {
  const g = normalize(guess);
  return g.length > 0 && g === normalize(answer);
}

/** Are all clues solved? */
export function isComplete(solved: ReadonlySet<number>, total: number): boolean {
  return total > 0 && solved.size >= total;
}

/**
 * Progressive quote reveal: split the quote into words and unmask the first
 * `ceil(words * solved/total)` of them; the rest render as underscore masks
 * (length-matched, no letter-index math). Fully solved ⇒ every word shows.
 */
export function revealQuote(quote: string, solvedCount: number, total: number): string[] {
  const words = quote.split(/\s+/).filter((w) => w.length > 0);
  if (total <= 0) return words;
  const shown =
    solvedCount >= total ? words.length : Math.ceil((words.length * solvedCount) / total);
  return words.map((w, i) => (i < shown ? w : w.replace(/[^\s]/g, '_')));
}
