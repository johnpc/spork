/**
 * Pure reducers for the play session's found-set + score. The engine is
 * mode-agnostic: every renderer (map, list, grid…) reads the same found set of
 * answer ids. `applyFound` returns a NEW set (never mutates) so React state
 * updates stay referentially honest. No timer/clock here — see tickTimer.
 */

/** Add a found answer id, returning a new set (idempotent). */
export function applyFound(found: ReadonlySet<string>, answerId: string): Set<string> {
  const next = new Set(found);
  next.add(answerId);
  return next;
}

/** Whole-number percentage found (0 when the quiz has no answers). */
export function scorePercent(found: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((found / total) * 100);
}

/** All answers found → the session is complete. */
export function isComplete(found: number, total: number): boolean {
  return total > 0 && found >= total;
}
