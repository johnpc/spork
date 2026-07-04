/**
 * Pure Spelling Bee engine. A valid word uses only the 7 letters (repeats ok),
 * includes the center letter, and is ≥4 letters. Score: 4-letter = 1pt, longer =
 * length points, pangram (all 7 distinct letters) = +7 bonus. All pure helpers.
 */

export interface ValidateResult {
  ok: boolean;
  reason: 'too-short' | 'no-center' | 'bad-letter' | 'not-a-word' | 'already-found' | 'ok';
}

/** Is `word` a pangram (uses all 7 distinct letters)? */
export function isPangram(word: string, letters: string): boolean {
  const letterSet = new Set(letters);
  if (letterSet.size !== 7) return false;
  const wordSet = new Set(word);
  for (const l of letterSet) {
    if (!wordSet.has(l)) return false;
  }
  return true;
}

/** Score a word: 4-letter = 1, longer = length, pangram +7. */
export function scoreWord(word: string, letters: string): number {
  const base = word.length === 4 ? 1 : word.length;
  return base + (isPangram(word, letters) ? 7 : 0);
}

/** Validate a guess. All checks in priority order. */
export function validateGuess(
  word: string,
  {
    letters,
    centerLetter,
    answers,
    foundWords,
  }: {
    letters: string;
    centerLetter: string;
    answers: string[];
    foundWords: string[];
  },
): ValidateResult {
  if (word.length < 4) return { ok: false, reason: 'too-short' };
  if (!word.includes(centerLetter)) return { ok: false, reason: 'no-center' };
  const letterSet = new Set(letters);
  for (const c of word) {
    if (!letterSet.has(c)) return { ok: false, reason: 'bad-letter' };
  }
  if (!answers.includes(word)) return { ok: false, reason: 'not-a-word' };
  if (foundWords.includes(word)) return { ok: false, reason: 'already-found' };
  return { ok: true, reason: 'ok' };
}
