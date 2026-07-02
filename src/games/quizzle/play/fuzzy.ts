/**
 * Pure fuzzy string matching for Quizzle answers — forgives typos so a near-miss
 * like "millenium falcon" (one dropped n) still counts. Levenshtein edit
 * distance with a length-scaled tolerance: short answers must be near-exact,
 * longer ones tolerate more slips. Pure + deterministic → unit-tested.
 */

/** Levenshtein edit distance (insert/delete/substitute), iterative + O(n·m). */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

/** Allowed edits for a target of the given length. ≤3 chars: exact only (avoids
 * false positives on short words); then ~1 edit per 6 chars, capped at 3. */
export function tolerance(len: number): number {
  if (len <= 3) return 0;
  return Math.min(3, Math.floor(len / 6) + 1);
}

/** Is `guess` within typo tolerance of `target`? (both already normalized) */
export function fuzzyMatch(guess: string, target: string): boolean {
  if (!guess || !target) return false;
  return editDistance(guess, target) <= tolerance(target.length);
}
