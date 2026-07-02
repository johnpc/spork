import { PlayInput } from './PlayInput';
import { PlayDone } from './PlayDone';

interface PlayControlsProps {
  status: 'idle' | 'running' | 'done';
  typed: boolean;
  best: number | null;
  score: { found: number; total: number };
  timeSeconds: number;
  submit: (guess: string) => boolean;
  start: () => void;
  giveUp: () => void;
}

/** The below-the-board controls for a quiz, by status: an explicit Start lobby
 * for typed modes when idle (click modes auto-start); the live input + Give Up
 * while running; the score summary (with time taken) when done. Extracted so
 * Play stays a thin page shell. */
export function PlayControls(p: PlayControlsProps) {
  if (p.status === 'done') {
    return <PlayDone found={p.score.found} total={p.score.total} timeSeconds={p.timeSeconds} />;
  }
  return (
    <>
      {p.status === 'idle' && p.typed && (
        <div className="play__lobby">
          {p.best != null && (
            <p className="sp-muted" data-testid="play-best">
              Your best: {p.best} / {p.score.total}
            </p>
          )}
          <button className="play__start" data-testid="play-start" onClick={p.start}>
            Start
          </button>
        </div>
      )}
      {p.typed && p.status === 'running' && <PlayInput onSubmit={p.submit} live />}
      {(p.status === 'running' || !p.typed) && (
        <button className="play__giveup" data-testid="play-giveup" onClick={p.giveUp}>
          Give up
        </button>
      )}
    </>
  );
}
