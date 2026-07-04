/** Play area sub-component: input, feedback, hive, actions, found list. */
import { Hive } from './Hive';

const ERRORS: Record<string, string> = {
  'too-short': 'Too short (need 4+ letters).',
  'no-center': 'Missing the center letter.',
  'bad-letter': 'Invalid letter.',
  'not-a-word': 'Not in word list.',
  'already-found': 'Already found!',
};

interface BeePlayAreaProps {
  current: string;
  found: string[];
  score: number;
  answersTotal: number;
  centerLetter: string;
  outerOrder: string[];
  pangrams: string[];
  lastResult: { ok: boolean; reason: string } | null;
  onType: (letter: string) => void;
  onBackspace: () => void;
  onShuffle: () => void;
  onSubmit: () => void;
}

export function BeePlayArea(p: BeePlayAreaProps) {
  return (
    <div className="spelling-bee" data-testid="spelling-bee">
      <div className="spelling-bee__header">
        <p className="sp-muted">
          Found: {p.found.length} / {p.answersTotal}
        </p>
        <p className="sp-muted" data-testid="bee-score">
          Score: {p.score}
        </p>
      </div>
      <div className="spelling-bee__input-display" data-testid="bee-input">
        {p.current.toUpperCase() || ' '}
      </div>
      {p.lastResult && !p.lastResult.ok && (
        <p className="spelling-bee__error" data-testid="bee-error" role="alert">
          {ERRORS[p.lastResult.reason] ?? 'Invalid.'}
        </p>
      )}
      {p.lastResult && p.lastResult.ok && (
        <p className="spelling-bee__success" data-testid="bee-success" role="status">
          Nice!
        </p>
      )}
      <Hive centerLetter={p.centerLetter} outerLetters={p.outerOrder} onLetterClick={p.onType} />
      <div className="spelling-bee__actions">
        <button data-testid="bee-delete" onClick={p.onBackspace} disabled={!p.current}>
          Delete
        </button>
        <button data-testid="bee-shuffle" onClick={p.onShuffle}>
          Shuffle
        </button>
        <button data-testid="bee-enter" onClick={p.onSubmit} disabled={!p.current}>
          Enter
        </button>
      </div>
      <ul className="spelling-bee__found" data-testid="bee-found-list">
        {p.found.map((w, i) => (
          <li key={i} data-testid="bee-found-word">
            {w.toUpperCase()}
            {p.pangrams.includes(w) && ' 🎉'}
          </li>
        ))}
      </ul>
    </div>
  );
}
