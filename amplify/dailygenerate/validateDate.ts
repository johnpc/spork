/**
 * Guardrails for on-demand generation: only a real calendar date, and only in
 * the past or today (never the future — we don't spoil upcoming dailies, and it
 * caps the addressable set of generatable dates). Pure so it's unit-tested; the
 * handler passes `new Date()`.
 */

/** UTC YYYY-MM-DD for a Date. */
export function utcStamp(d: Date): string {
  return `${d.getUTCFullYear()}-${`${d.getUTCMonth() + 1}`.padStart(2, '0')}-${`${d.getUTCDate()}`.padStart(2, '0')}`;
}

/** Throw unless `date` is a well-formed YYYY-MM-DD that is ≤ today (UTC). */
export function assertPastOrToday(date: string, now: Date): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`invalid puzzle date "${date}" (expected YYYY-MM-DD)`);
  }
  // Round-trip through Date to reject impossible calendar dates (e.g. 2026-02-31).
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || utcStamp(parsed) !== date) {
    throw new Error(`invalid puzzle date "${date}"`);
  }
  if (date > utcStamp(now)) {
    throw new Error(`puzzle date "${date}" is in the future`);
  }
}
