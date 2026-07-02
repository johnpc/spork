import { useState, useCallback, type FormEvent } from 'react';

/** The next-word input for a word ladder: type a word, submit on Enter. Clears
 * on a valid step; keeps the text on an invalid one so the player can fix it. */
export function StepInput({ onSubmit }: { onSubmit: (word: string) => boolean }) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!value.trim()) return;
      if (onSubmit(value)) setValue('');
    },
    [value, onSubmit],
  );

  return (
    <form className="step-input" onSubmit={handleSubmit}>
      <input
        className="step-input__box"
        data-testid="step-input"
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Next word…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
