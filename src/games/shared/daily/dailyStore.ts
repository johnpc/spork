/**
 * Per-device "played today" store for the daily-puzzle model. Each game shows
 * ONE puzzle per day; once the player finishes it, we record their result keyed
 * by game + date so a return visit shows a "come back tomorrow" screen instead
 * of letting them replay. Pure over an injected KeyValueStore (localStorage in
 * the app, in-memory in tests). Reads degrade to "not played" on any error.
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** A finished daily result: the headline score + optional time, for the recap. */
export interface DailyResult {
  score: number;
  total: number;
  timeSeconds?: number;
}

const KEY = (game: string, date: string) => `spork.daily.${game}.${date}`;

/** The player's result for `game` on `date`, or null if not yet played. */
export function readDailyResult(
  store: KeyValueStore,
  game: string,
  date: string,
): DailyResult | null {
  try {
    const raw = store.getItem(KEY(game, date));
    if (!raw) return null;
    const v: unknown = JSON.parse(raw);
    if (typeof v !== 'object' || v === null) return null;
    const o = v as Record<string, unknown>;
    if (typeof o.score !== 'number' || typeof o.total !== 'number') return null;
    return {
      score: o.score,
      total: o.total,
      timeSeconds: typeof o.timeSeconds === 'number' ? o.timeSeconds : undefined,
    };
  } catch {
    return null;
  }
}

/** Record today's result once. Never overwrites an existing result (the daily is
 * play-once, so the first finish is the one that counts). Returns the stored one. */
export function recordDailyResult(
  store: KeyValueStore,
  game: string,
  date: string,
  result: DailyResult,
): DailyResult {
  const existing = readDailyResult(store, game, date);
  if (existing) return existing;
  try {
    store.setItem(KEY(game, date), JSON.stringify(result));
  } catch {
    /* ignore quota/private-mode — daily gating is best-effort */
  }
  return result;
}
