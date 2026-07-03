/** Time until the next daily puzzle unlocks — i.e. until local midnight. Pure
 * and injectable so it's unit-tested without touching the real clock. */

/** Milliseconds from `now` until the next local midnight (0 < ms ≤ 86_400_000). */
export function msUntilMidnight(now: Date): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

/** Format a remaining duration as "Hh Mm" (e.g. 3h 07m), for the recap countdown.
 * Rounds the minute up so it never shows "0m" while time remains. */
export function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${`${m}`.padStart(2, '0')}m`;
}
