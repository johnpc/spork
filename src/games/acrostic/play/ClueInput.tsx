import { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';

/** One clue with its answer input: matches LIVE as you type — a correct answer
 * solves the clue the moment it's typed (no Enter needed); Enter still works.
 * The text clears on a solve and is kept on a miss so you can fix a typo. */
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
  onGuess: (index: number, text: string, flagWrong?: boolean) => boolean;
}) {
  const [value, setValue] = useState('');

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      // Live: try each keystroke silently (no wrong-flash); keep the text unless
      // it solved the clue.
      if (text.trim() && onGuess(index, text, false)) {
        setValue('');
        return;
      }
      setValue(text);
    },
    [onGuess, index],
  );

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
            onChange={handleChange}
          />
        </form>
      )}
    </li>
  );
}
