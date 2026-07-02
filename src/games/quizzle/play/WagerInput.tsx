import { useState, useCallback, type FormEvent } from 'react';

/** Set the wager for the current question: a number in [1, bank], submitted to
 * lock it in and reveal the question. Defaults to the whole bank so a confident
 * player can go all-in fast. */
export function WagerInput({ bank, onWager }: { bank: number; onWager: (amount: number) => void }) {
  const [value, setValue] = useState(String(bank));

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const n = Number.parseInt(value, 10);
      onWager(Number.isFinite(n) ? n : 1);
    },
    [value, onWager],
  );

  return (
    <form className="quizzle__wager" onSubmit={handleSubmit}>
      <label className="sp-muted" htmlFor="quizzle-wager">
        Wager (1–{bank})
      </label>
      <input
        id="quizzle-wager"
        className="quizzle__input"
        data-testid="wager-input"
        type="number"
        inputMode="numeric"
        min={1}
        max={bank}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="quizzle__btn" data-testid="wager-submit" type="submit">
        Lock in wager
      </button>
    </form>
  );
}
