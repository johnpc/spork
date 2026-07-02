/**
 * Pure Acrostic engine. This word puzzle shares NOTHING with the Quizzes engine —
 * no found-set, no timer. It is a TRUE acrostic: the FIRST LETTER of each clue's
 * answer, read top to bottom, spells a hidden SECRET WORD. A clue is solved when
 * the normalized guess equals its answer; solving it reveals that answer's first
 * letter in the secret-word strip. Solve every clue ⇒ the whole word is spelled
 * out and the quote about it is revealed. All pure + deterministic.
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

/** The hidden word the answers' initials spell (uppercase), in clue order. */
export function secretWord(clues: Clue[]): string {
  return clues.map((c) => (c.answer[0] ?? '').toUpperCase()).join('');
}

/** One box in the secret-word strip: its letter, revealed once its clue is
 * solved (else masked). Index-aligned with the clues. */
export interface WordSlot {
  letter: string;
  revealed: boolean;
}

/** The secret-word slots given which clue indices are solved. */
export function wordSlots(clues: Clue[], solved: ReadonlySet<number>): WordSlot[] {
  return clues.map((c, i) => ({
    letter: (c.answer[0] ?? '').toUpperCase(),
    revealed: solved.has(i),
  }));
}
