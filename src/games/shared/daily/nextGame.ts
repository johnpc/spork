import { QUIZ_TYPE_GAMES, OTHER_GAMES } from '../../gameCatalog';
import { DAILY_GAMES } from './dailyGames';

/** The daily games in shelf order that have a real daily puzzle route (excludes
 * Flashcards, which browses Discover). Each carries its slug + localStorage key. */
export interface DailyRef {
  slug: string;
  name: string;
  dailyKey: string;
}

export const DAILY_REFS: DailyRef[] = [...QUIZ_TYPE_GAMES, ...OTHER_GAMES]
  .map((g) => {
    const entry = DAILY_GAMES[g.slug];
    return entry ? { slug: g.slug, name: g.name, dailyKey: entry.dailyKey } : null;
  })
  .filter((r): r is DailyRef => r !== null);

/** Pick the next daily game the player hasn't finished today, starting AFTER the
 * current game in shelf order and wrapping around. Returns null when everything
 * else is done (or the current slug is unknown). Pure over the played-key set. */
export function nextUnplayed(currentSlug: string, playedKeys: Set<string>): DailyRef | null {
  const start = DAILY_REFS.findIndex((r) => r.slug === currentSlug);
  if (start < 0) return null;
  for (let i = 1; i < DAILY_REFS.length; i += 1) {
    const ref = DAILY_REFS[(start + i) % DAILY_REFS.length];
    if (!playedKeys.has(ref.dailyKey)) return ref;
  }
  return null;
}
