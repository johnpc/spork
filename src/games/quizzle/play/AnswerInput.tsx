import { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { isCorrect, type QuizzleQuestion } from './quizzleEngine';

/** Type an answer for the current question (wager already locked). Matches LIVE:
 * as soon as what you've typed is correct it auto-submits (locking the win) — no
 * Enter needed. A wrong/uncertain answer is only committed when you hit Enter or
 * the Submit button, so partial typing never loses your wager. */
export function AnswerInput({
  question,
  onAnswer,
}: {
  question: QuizzleQuestion;
  onAnswer: (guess: string) => void;
}) {
  const [value, setValue] = useState('');

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setValue(text);
      // Auto-submit the moment the typed answer is correct.
      if (text.trim() && isCorrect(text, question)) onAnswer(text);
    },
    [question, onAnswer],
  );

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
        onChange={handleChange}
      />
      <button className="quizzle__btn" data-testid="answer-submit" type="submit">
        Submit answer
      </button>
    </form>
  );
}
