import { Link } from 'react-router-dom';
import type { GameCard } from './homeGames';
import type { DailyResult } from '../../games/shared/daily/dailyStore';

/** One game card on the Home shelf. Shows a badge with the score when the player
 * has finished this game's puzzle for the VIEWED day. When browsing a past day
 * (`date` set), a daily card links to that day's dated route; today keeps the
 * bare /daily/<slug> path. Non-daily cards (e.g. Flashcards) ignore the date. */
export function HomeCard({
  game,
  result,
  date,
}: {
  game: GameCard;
  result: DailyResult | null;
  date?: string;
}) {
  // Only daily cards (routed to /daily/<slug>) get a dated permalink.
  const to =
    date && game.dailyKey && game.to.startsWith('/daily/') ? `${game.to}/${date}` : game.to;
  return (
    <Link
      className={`home-card${result ? ' home-card--done' : ''}`}
      to={to}
      data-testid={game.testId}
      style={{ background: game.accent }}
    >
      <span className="home-card__emoji" aria-hidden="true">
        {game.emoji}
      </span>
      <span className="home-card__body">
        <span className="home-card__name">{game.name}</span>
        <span className="home-card__tagline">{game.tagline}</span>
      </span>
      {result && (
        <span className="home-card__badge" data-testid={`${game.testId}-done`}>
          ✅ {result.score}/{result.total}
        </span>
      )}
    </Link>
  );
}
