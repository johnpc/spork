/** Local calendar-day stamp (YYYY-MM-DD) for the daily-puzzle model. Pure: the
 * clock is injected so it's deterministic in tests (the app passes new Date()).
 * Uses LOCAL date parts so "today" matches the player's wall clock, not UTC. */
export function dayStamp(now: Date): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}
