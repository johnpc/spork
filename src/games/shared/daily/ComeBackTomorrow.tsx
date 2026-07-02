import { Link } from 'react-router-dom';
import './comeBack.css';

interface ComeBackTomorrowProps {
  game: string; // display name, e.g. "Quizzes"
  score: number;
  total: number;
  timeSeconds?: number;
}

/** Shown when the player has already finished today's puzzle for a game. Recaps
 * their result and points them home — the daily is play-once, so no replay. */
export function ComeBackTomorrow({ game, score, total, timeSeconds }: ComeBackTomorrowProps) {
  return (
    <div className="come-back" data-testid="come-back">
      <span className="come-back__emoji" aria-hidden="true">
        ✅
      </span>
      <h2 className="sp-heading come-back__title">Today’s {game} is done!</h2>
      <p className="come-back__score" data-testid="come-back-score">
        {score} / {total}
        {timeSeconds != null ? ` · ${timeSeconds}s` : ''}
      </p>
      <p className="sp-muted">Come back tomorrow for a new puzzle.</p>
      <Link className="come-back__home" to="/home" data-testid="come-back-home">
        Back to games
      </Link>
    </div>
  );
}
