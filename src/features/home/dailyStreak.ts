import { dayStamp } from '../../games/shared/daily/today';

/** The day-stamp one calendar day before `stamp`, in the same LOCAL stamp space
 * the played-set and anchors use (parse local, step back 24h, re-stamp). */
function prevStamp(stamp: string): string {
  const [y, m, d] = stamp.split('-').map(Number);
  return dayStamp(new Date(y, m - 1, d - 1));
}

/**
 * The cross-game daily streak, DERIVED from the days the player finished at least
 * one puzzle (no stored counter to drift out of sync). A streak is the run of
 * consecutive calendar days ending today — or yesterday, so a day that hasn't
 * been played yet doesn't prematurely break a live streak. Pure over the set of
 * played day-stamps + an injected clock, so it's fully unit-tested.
 */
export function currentStreak(playedDates: Set<string>, now: Date): number {
  if (playedDates.size === 0) return 0;
  const today = dayStamp(now);
  const yesterday = prevStamp(today);
  // Anchor at today if played, else yesterday if played, else the streak is dead.
  let anchor: string | null = null;
  if (playedDates.has(today)) anchor = today;
  else if (playedDates.has(yesterday)) anchor = yesterday;
  if (!anchor) return 0;

  let count = 1;
  let cursor = anchor;
  // Walk backwards one day at a time while each prior day was also played.
  for (;;) {
    const prev = prevStamp(cursor);
    if (!playedDates.has(prev)) break;
    count += 1;
    cursor = prev;
  }
  return count;
}
