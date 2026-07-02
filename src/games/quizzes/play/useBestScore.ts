import { useCallback, useState } from 'react';
import { readBestScore, type KeyValueStore } from './bestScoreStore';

/** The device store (localStorage), or a no-op if unavailable (SSR/tests). */
function deviceStore(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * This device's saved best score for a quiz (guest-only — localStorage, no
 * account). `refresh` re-reads it after a session ends so the lobby reflects a
 * newly-saved best without a reload. Null when never played / store unavailable.
 */
export function useBestScore(quizId: string | undefined, store = deviceStore()) {
  const read = useCallback(
    () => (quizId && store ? readBestScore(store, quizId) : null),
    [quizId, store],
  );
  const [best, setBest] = useState<number | null>(read);
  const refresh = useCallback(() => setBest(read()), [read]);
  return { best, refresh };
}
