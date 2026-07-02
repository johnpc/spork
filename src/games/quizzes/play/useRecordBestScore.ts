import { useEffect, useRef } from 'react';
import { saveBestScore, type KeyValueStore } from './bestScoreStore';

/** The device store (localStorage), or null if unavailable (SSR/tests). */
function deviceStore(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Persist the session's best score to the device exactly once when `done` flips
 * true, then re-arm if the session restarts (reset). Guest-only — writes to
 * localStorage via bestScoreStore (no account, no network). A ref guards the
 * StrictMode double-invoke; the store itself no-ops on quota/private-mode.
 */
export function useRecordBestScore(
  done: boolean,
  quizId: string | undefined,
  found: number,
  store = deviceStore(),
): void {
  const recorded = useRef(false);
  useEffect(() => {
    if (done && !recorded.current && quizId && store) {
      recorded.current = true;
      saveBestScore(store, quizId, found);
    }
    if (!done) recorded.current = false;
  }, [done, quizId, found, store]);
}
