import { useState, useCallback, type FormEvent } from 'react';

/** One clue with its answer input: type an answer, submit on Enter. Clears + is
 * replaced by the solved answer when correct; keeps the text when wrong so the
 * player can fix it. Mirrors StepInput. */
export function ClueInput({
  index,
  clue,
  answer,
  solved,
  wrong,
  onGuess,
}: {
  index: number;
  clue: string;
  answer: string;
  solved: boolean;
  wrong: boolean;
  onGuess: (index: number, text: string) => boolean;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!value.trim()) return;
      if (onGuess(index, value)) setValue('');
    },
    [value, onGuess, index],
  );

  const initial = (answer[0] ?? '').toUpperCase();
  return (
    <li className={solved ? 'clue clue--solved' : 'clue'} data-testid="clue">
      <span className="clue__row">
        <span className="clue__initial" aria-label={`starts with ${initial}`}>
          {initial}
        </span>
        <span className="clue__text">{clue}</span>
      </span>
      {solved ? (
        <span className="clue__answer" data-testid="clue-answer">
          {answer.toUpperCase()}
        </span>
      ) : (
        <form className="clue-input" onSubmit={handleSubmit}>
          <input
            className={wrong ? 'clue-input__box clue-input__box--wrong' : 'clue-input__box'}
            data-testid={`clue-input-${index}`}
            type="text"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={`Starts with ${initial}…`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </form>
      )}
    </li>
  );
}
