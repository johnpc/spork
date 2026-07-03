import { Link } from 'react-router-dom';
import { ShareButton } from './ShareButton';
import { NextPuzzleCountdown } from './NextPuzzleCountdown';
import './comeBack.css';

interface ComeBackTomorrowProps {
  game: string; // display name, e.g. "Quizzes"
  score: number;
  total: number;
  timeSeconds?: number;
  date?: string; // YYYY-MM-DD — for the share string
  nextTo?: string; // route of the next unplayed daily game, if any
  nextName?: string; // its display name
}

/** Shown when the player has already finished today's puzzle for a game. Recaps
 * their result, lets them SHARE it, offers the next unplayed daily game, counts
 * down to tomorrow, and points home — the daily is play-once, so no replay. */
export function ComeBackTomorrow({
  game,
  score,
  total,
  timeSeconds,
  date,
  nextTo,
  nextName,
}: ComeBackTomorrowProps) {
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
      {date && (
        <ShareButton
          game={game}
          score={score}
          total={total}
          timeSeconds={timeSeconds}
          date={date}
        />
      )}
      <NextPuzzleCountdown />
      {nextTo && (
        <Link className="come-back__next" to={nextTo} data-testid="come-back-next">
          Play {nextName} →
        </Link>
      )}
      <Link className="come-back__home" to="/home" data-testid="come-back-home">
        Back to games
      </Link>
    </div>
  );
}
