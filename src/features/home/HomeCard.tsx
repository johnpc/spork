import { Link } from 'react-router-dom';
import type { GameCard } from './homeGames';
import type { DailyResult } from '../../games/shared/daily/dailyStore';

/** One game card on the Home shelf. Shows a "done today" badge with the score
 * when the player has already finished this game's daily puzzle. */
export function HomeCard({ game, result }: { game: GameCard; result: DailyResult | null }) {
  return (
    <Link
      className={`home-card${result ? ' home-card--done' : ''}`}
      to={game.to}
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
