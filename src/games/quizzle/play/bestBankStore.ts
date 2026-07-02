/**
 * Per-device best-bank store for the guest-only Quizzle game. A Quizzle is a
 * one-shot wager session, so the player's best final bank lives in localStorage
 * keyed by quizzle id — no account, no backend. Mirrors the Quizzes
 * bestScoreStore: pure + injectable storage, unit-tested without a real Window,
 * and tolerant of a missing/broken store (private mode, quota).
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const KEY = (quizzleId: string) => `spork.quizzle.bestBank.${quizzleId}`;

/** Read the saved best final bank for a quizzle, or null if none/unreadable. */
export function readBestBank(store: KeyValueStore, quizzleId: string): number | null {
  try {
    const raw = store.getItem(KEY(quizzleId));
    if (raw == null) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Persist `bank` as the new best only when it beats the stored value. Returns
 * the resulting best (the larger of stored and `bank`). */
export function saveBestBank(store: KeyValueStore, quizzleId: string, bank: number): number {
  const prior = readBestBank(store, quizzleId) ?? 0;
  if (bank <= prior) return prior;
  try {
    store.setItem(KEY(quizzleId), String(bank));
  } catch {
    /* ignore quota/private-mode failures — best bank is best-effort */
  }
  return bank;
}
