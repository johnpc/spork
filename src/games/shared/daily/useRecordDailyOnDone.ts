import { useEffect, useRef } from 'react';
import { dayStamp } from './today';
import { recordDailyResult, type DailyResult, type KeyValueStore } from './dailyStore';

/** The device store (localStorage), or null if unavailable (SSR/tests). */
function deviceStore(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Record a daily result for `game` on `day` (defaults to today) exactly once when
 * `done` flips true. Threading the puzzle's OWN date lets a past-day session write
 * its badge under the correct date. Mirrors useRecordBestScore: a ref guards
 * StrictMode's double-invoke, the daily store is play-once (first finish wins),
 * writes no-op on quota/private-mode. `now`/`store` are injectable for tests.
 */
export function useRecordDailyOnDone(
  game: string,
  done: boolean,
  result: DailyResult,
  day?: string,
  now: Date = new Date(),
  store = deviceStore(),
): void {
  const date = day ?? dayStamp(now);
  const recorded = useRef(false);
  useEffect(() => {
    if (done && !recorded.current && store) {
      recorded.current = true;
      recordDailyResult(store, game, date, result);
    }
  }, [done, game, date, result, store]);
}
