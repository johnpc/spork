import { currentStreak } from './dailyStreak';
import { allKeys, playedDatesFrom } from './playedDates';

/** The player's live cross-game daily streak, derived from the days they've
 * finished any puzzle (scanned from localStorage). `now`/`store` are injectable
 * for tests; the app uses the real clock + storage. The scan is a cheap key walk,
 * so it runs each render — no memo needed. */
function deviceStore(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useDailyStreak(
  now: Date = new Date(),
  store: Storage | null = deviceStore(),
): number {
  if (!store) return 0;
  const dates = playedDatesFrom(allKeys(store));
  return currentStreak(dates, now);
}
