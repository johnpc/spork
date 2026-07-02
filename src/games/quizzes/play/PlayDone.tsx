import { Link } from 'react-router-dom';
import { scorePercent } from './scoreState';
import { formatClock } from './tickTimer';

interface PlayDoneProps {
  found: number;
  total: number;
  /** Seconds taken, shown as part of the score (daily puzzles are one-per-day). */
  timeSeconds?: number;
}

/** End-of-session summary: final score + percent + time taken. Daily puzzles are
 * play-once, so there's no replay — just a way back to the game shelf. */
export function PlayDone({ found, total, timeSeconds }: PlayDoneProps) {
  return (
    <div className="play-done" data-testid="play-done">
      <p className="sp-heading play-done__score" data-testid="play-final-score">
        {found} / {total}
      </p>
      <p className="sp-muted">
        {scorePercent(found, total)}% found
        {timeSeconds != null ? ` · ${formatClock(timeSeconds)}` : ''}
      </p>
      <Link to="/home" className="play__start" data-testid="play-home">
        Back to games
      </Link>
    </div>
  );
}
