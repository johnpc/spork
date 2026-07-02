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
 * Record today's daily result for `game` exactly once when `done` flips true.
 * Mirrors useRecordBestScore: a ref guards StrictMode's double-invoke, the daily
 * store is play-once (first finish wins), and writes no-op on quota/private-mode.
 * `now`/`store` are injectable for tests.
 */
export function useRecordDailyOnDone(
  game: string,
  done: boolean,
  result: DailyResult,
  now: Date = new Date(),
  store = deviceStore(),
): void {
  const date = dayStamp(now);
  const recorded = useRef(false);
  useEffect(() => {
    if (done && !recorded.current && store) {
      recorded.current = true;
      recordDailyResult(store, game, date, result);
    }
  }, [done, game, date, result, store]);
}
