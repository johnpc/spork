import { StepInput } from './StepInput';
import { LadderPath } from './LadderPath';
import { StepsSolution } from './StepsSolution';
import type { useLadder } from './useLadder';

const ERRORS: Record<string, string> = {
  length: 'Must be the same length.',
  'not-a-word': 'Not in the word list.',
  'not-one-letter': 'Change exactly one letter.',
  repeat: 'Already used that word.',
};

/** The inner play surface: goal + path + input/actions or solution. */
export function StepsContent({ l }: { l: ReturnType<typeof useLadder> }) {
  if (!l.ladder) {
    return (
      <p className="sp-muted" data-testid="steps-unavailable">
        This puzzle can't be played yet.
      </p>
    );
  }
  return (
    <div className="steps" data-testid="steps">
      <p className="steps__goal" data-testid="steps-goal">
        <strong>{l.start.toUpperCase()}</strong> → <strong>{l.target.toUpperCase()}</strong>
      </p>
      <p className="sp-muted steps__intro">
        Change <strong>one letter</strong> at a time — each step must be a real word.
      </p>
      <p className="sp-muted steps__meta">
        {l.moves} moves{l.par ? ` · par ${l.par}` : ''}
      </p>
      <LadderPath path={l.path} target={l.target} />
      {l.solved ? (
        <p className="steps__solved" data-testid="steps-solved" role="status">
          Solved in {l.moves} moves! {l.par && l.moves <= l.par ? '🏆 par or better' : ''}
        </p>
      ) : l.gaveUp ? (
        <StepsSolution parPath={l.parPath} />
      ) : (
        <>
          <StepInput onSubmit={l.submit} />
          {l.lastError && (
            <p className="steps__error" data-testid="steps-error" role="alert">
              {ERRORS[l.lastError] ?? 'Invalid move.'}
            </p>
          )}
          <div className="steps__actions">
            <button data-testid="steps-undo" onClick={l.undo} disabled={l.moves === 0}>
              Undo
            </button>
            <button data-testid="steps-reset" onClick={l.reset} disabled={l.moves === 0}>
              Reset
            </button>
            <button data-testid="steps-giveup" onClick={l.giveUp}>
              Give up
            </button>
          </div>
        </>
      )}
    </div>
  );
}
