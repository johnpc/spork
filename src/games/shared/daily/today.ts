/** Local calendar-day stamp (YYYY-MM-DD) for the daily-puzzle model. Pure: the
 * clock is injected so it's deterministic in tests (the app passes new Date()).
 * Uses LOCAL date parts so "today" matches the player's wall clock, not UTC. */
export function dayStamp(now: Date): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** True if `s` is a real YYYY-MM-DD calendar date (rejects e.g. 2026-02-31). */
export function isValidDayStamp(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00`);
  return !Number.isNaN(d.getTime()) && dayStamp(d) === s;
}

/** True if the stamp `s` is a day AFTER today — used to forbid browsing/
 * generating the future (we don't spoil upcoming dailies). */
export function isFuture(s: string, now: Date): boolean {
  return s > dayStamp(now);
}

/** The day before `s` (YYYY-MM-DD → YYYY-MM-DD). */
export function prevDay(s: string): string {
  const d = new Date(`${s}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return dayStamp(d);
}

/** The day after `s`. */
export function nextDay(s: string): string {
  const d = new Date(`${s}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return dayStamp(d);
}
