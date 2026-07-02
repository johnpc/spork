/**
 * Per-device best-score store for the guest-only Quizzes game. A quiz is a timed
 * session, so we keep the player's best found-count in localStorage keyed by
 * quiz id — no account, no backend. Pure + injectable storage so it's unit-tested
 * without a real Window. Reads/writes tolerate a missing or broken store (private
 * mode, quota) by degrading to "no saved score" rather than throwing.
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const KEY = (quizId: string) => `spork.bestScore.${quizId}`;

/** Read the saved best found-count for a quiz, or null if none/unreadable. */
export function readBestScore(store: KeyValueStore, quizId: string): number | null {
  try {
    const raw = store.getItem(KEY(quizId));
    if (raw == null) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Persist `found` as the new best only when it beats the stored value. Returns
 * the resulting best (the larger of stored and `found`). */
export function saveBestScore(store: KeyValueStore, quizId: string, found: number): number {
  const prior = readBestScore(store, quizId) ?? 0;
  if (found <= prior) return prior;
  try {
    store.setItem(KEY(quizId), String(found));
  } catch {
    /* ignore quota/private-mode failures — best score is best-effort */
  }
  return found;
}
