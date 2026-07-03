/** The Home game shelf data — one card per daily game, derived from the shared
 * game catalog (each quiz TYPE is its own game + the standalone islands). Cards
 * route to /daily/<slug> (or a game's own href, e.g. Flashcards → Discover).
 * DATA, not logic. */
import { ALL_GAMES } from '../../games/gameCatalog';
import { DAILY_GAMES } from '../../games/shared/daily/dailyGames';

export interface GameCard {
  name: string;
  tagline: string;
  to: string;
  testId: string;
  emoji: string;
  accent: string; // gradient for the card face
  /** localStorage daily key, for showing today's completion badge (daily games
   * only; Flashcards and other non-daily entries have none). */
  dailyKey?: string;
}

export const GAMES: GameCard[] = ALL_GAMES.map((g) => ({
  name: g.name,
  tagline: g.tagline,
  to: g.href ?? `/daily/${g.slug}`,
  testId: `game-${g.slug}`,
  emoji: g.emoji,
  accent: g.accent,
  dailyKey: DAILY_GAMES[g.slug]?.dailyKey,
}));
