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
}

/** Shown when the player has already finished today's puzzle for a game. Recaps
 * their result, lets them SHARE it, counts down to the next puzzle, and points
 * home — the daily is play-once, so no replay. */
export function ComeBackTomorrow({ game, score, total, timeSeconds, date }: ComeBackTomorrowProps) {
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
      <Link className="come-back__home" to="/home" data-testid="come-back-home">
        Back to games
      </Link>
    </div>
  );
}
