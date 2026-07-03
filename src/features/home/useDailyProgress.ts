import { useMemo } from 'react';
import { dayStamp } from '../../games/shared/daily/today';
import { readDailyResult, type DailyResult } from '../../games/shared/daily/dailyStore';

/** Today's completion state for the Home shelf, read straight from the device
 * store: which daily keys are done and their result, plus a done/total tally for
 * the hero. Pure over an injected clock/store so it's unit-tested; the app passes
 * localStorage. Non-daily cards (no key) don't count toward the total. */
export interface DailyProgress {
  done: number;
  total: number;
  resultFor: (dailyKey?: string) => DailyResult | null;
}

function deviceStore(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useDailyProgress(
  dailyKeys: (string | undefined)[],
  now: Date = new Date(),
  store = deviceStore(),
): DailyProgress {
  const date = dayStamp(now);
  // Join the keys to a stable primitive so the memo re-runs on content change,
  // not on the fresh array identity Home builds each render.
  const keyId = dailyKeys.filter(Boolean).join('|');
  return useMemo(() => {
    const keys = keyId ? keyId.split('|') : [];
    const results = new Map<string, DailyResult>();
    if (store) {
      for (const k of keys) {
        const r = readDailyResult(store, k, date);
        if (r) results.set(k, r);
      }
    }
    return {
      done: results.size,
      total: keys.length,
      resultFor: (k?: string) => (k ? (results.get(k) ?? null) : null),
    };
  }, [keyId, date, store]);
}
