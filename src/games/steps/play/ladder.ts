/**
 * Pure word-ladder engine. This game shares NOTHING with the Quizzes engine —
 * no found-set, no answer matching. A move is valid iff the next word differs
 * from the current word by exactly one letter (same length) AND is in the
 * puzzle's dictionary. The ladder is solved when the current word equals the
 * target. All pure + deterministic, so it's unit-tested without React or AWS.
 */

/** Do two equal-length words differ by exactly one letter? */
export function oneLetterApart(a: string, b: string): boolean {
  if (a.length !== b.length || a === b) return false;
  let diffs = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i] && ++diffs > 1) return false;
  }
  return diffs === 1;
}

export interface StepCheck {
  ok: boolean;
  reason?: 'length' | 'not-a-word' | 'not-one-letter' | 'repeat';
}

/** Validate a candidate next word from `current`, given the allowed word set and
 * the words already used (no repeats — keeps ladders forward-moving). */
export function checkStep(
  current: string,
  next: string,
  dictionary: ReadonlySet<string>,
  used: ReadonlySet<string>,
): StepCheck {
  if (next.length !== current.length) return { ok: false, reason: 'length' };
  if (!dictionary.has(next)) return { ok: false, reason: 'not-a-word' };
  if (!oneLetterApart(current, next)) return { ok: false, reason: 'not-one-letter' };
  if (used.has(next)) return { ok: false, reason: 'repeat' };
  return { ok: true };
}

/** Is the ladder solved (current word is the target)? */
export function isSolved(current: string, target: string): boolean {
  return current === target;
}

/** Fewest MOVES in a known solution path (steps beyond the start word). */
export function parMoves(parPath: string[]): number {
  return Math.max(0, parPath.length - 1);
}
