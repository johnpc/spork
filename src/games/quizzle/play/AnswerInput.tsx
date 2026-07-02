import { useState, useCallback, type FormEvent } from 'react';

/** Type an answer for the current question (wager already locked). Submits the
 * guess on Enter; the parent resolves it against the engine and reveals the
 * outcome. */
export function AnswerInput({ onAnswer }: { onAnswer: (guess: string) => void }) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!value.trim()) return;
      onAnswer(value);
    },
    [value, onAnswer],
  );

  return (
    <form className="quizzle__answer" onSubmit={handleSubmit}>
      <input
        className="quizzle__input"
        data-testid="answer-input"
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Your answer…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="quizzle__btn" data-testid="answer-submit" type="submit">
        Submit answer
      </button>
    </form>
  );
}
