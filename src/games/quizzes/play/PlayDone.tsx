import { scorePercent } from './scoreState';

interface PlayDoneProps {
  found: number;
  total: number;
  onReplay: () => void;
}

/** End-of-session summary: final score + percent, and a replay button. Shown
 * when the engine reaches 'done' (time up or all found). Mode-shared. */
export function PlayDone({ found, total, onReplay }: PlayDoneProps) {
  return (
    <div className="play-done" data-testid="play-done">
      <p className="sp-heading play-done__score" data-testid="play-final-score">
        {found} / {total}
      </p>
      <p className="sp-muted">{scorePercent(found, total)}% found</p>
      <button className="play__start" data-testid="play-replay" onClick={onReplay}>
        Play again
      </button>
    </div>
  );
}
