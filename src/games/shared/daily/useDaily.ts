import { useCallback, useState } from 'react';
import { dayStamp } from './today';
import {
  readDailyResult,
  recordDailyResult,
  type DailyResult,
  type KeyValueStore,
} from './dailyStore';

/** The device store (localStorage), or null if unavailable (SSR/tests). */
function deviceStore(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Daily play-once gate for a game on a given day (defaults to today). Reports
 * whether that day's puzzle for `game` was already finished on this device (with
 * the recap result) and exposes `record` to save the result when a session ends.
 * `day` lets a caller gate a PAST day (browse mode); `now`/`store` are injectable
 * for tests.
 */
export function useDaily(
  game: string,
  day?: string,
  now: Date = new Date(),
  store = deviceStore(),
) {
  const date = day ?? dayStamp(now);
  const read = useCallback(
    () => (store ? readDailyResult(store, game, date) : null),
    [store, game, date],
  );
  const [result, setResult] = useState<DailyResult | null>(read);

  const record = useCallback(
    (r: DailyResult) => {
      if (store) setResult(recordDailyResult(store, game, date, r));
    },
    [store, game, date],
  );

  return { date, playedToday: result != null, result, record };
}
