import { dayStamp } from './today';
import { readDailyResult } from './dailyStore';
import { DAILY_REFS, nextUnplayed, type DailyRef } from './nextGame';

/** The next daily game the player hasn't finished today, for the "Play next →"
 * nudge on a recap. Reads each game's played state from the device store and
 * defers the ordering to the pure nextUnplayed. `now`/`store` injectable. */
function deviceStore(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useNextGame(
  currentSlug: string,
  now: Date = new Date(),
  store: Storage | null = deviceStore(),
): DailyRef | null {
  const date = dayStamp(now);
  const played = new Set<string>();
  if (store) {
    for (const ref of DAILY_REFS) {
      if (readDailyResult(store, ref.dailyKey, date)) played.add(ref.dailyKey);
    }
  }
  return nextUnplayed(currentSlug, played);
}
