/**
 * Pure study-streak math. Given the prior streak state and the day a session
 * happened, compute the next state — by CALENDAR DAY, not timestamp:
 *   - same day as last study  → unchanged (studying twice today isn't a 2nd day)
 *   - the very next day        → current + 1 (streak continues)
 *   - a gap (or first ever)    → reset current to 1
 * `longest` only ever grows. Dates are YYYY-MM-DD strings (injected, testable).
 */
export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastStudiedDate?: string | null;
}

/** Days between two YYYY-MM-DD day stamps (b - a), via UTC midnight. */
export function daysBetween(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** Advance the streak for a session on `today` (YYYY-MM-DD). */
export function advanceStreak(prior: StreakState, today: string): StreakState {
  const last = prior.lastStudiedDate;
  let current: number;
  if (!last) current = 1;
  else {
    const gap = daysBetween(last, today);
    if (gap === 0)
      current = prior.currentStreak || 1; // already counted today
    else if (gap === 1) current = prior.currentStreak + 1;
    else current = 1; // missed a day (or future) → restart
  }
  return {
    currentStreak: current,
    longestStreak: Math.max(prior.longestStreak, current),
    lastStudiedDate: today,
  };
}
