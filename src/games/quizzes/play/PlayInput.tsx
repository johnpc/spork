import { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';

interface PlayInputProps {
  /** Submit a guess; returns true on a fresh match (drives the flash + clear). */
  onSubmit: (guess: string) => boolean;
  disabled?: boolean;
  /** When true, match live as you type (clearing on a hit) — no Enter needed. */
  live?: boolean;
}

/** Mode-shared guess box. With `live`, every keystroke is checked and the box
 * clears + flashes on a correct answer (Sporcle behavior) — no Enter required;
 * Enter still works as a fallback. A miss keeps the text so you can fix a typo. */
export function PlayInput({ onSubmit, disabled, live }: PlayInputProps) {
  const [value, setValue] = useState('');
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null);

  const tryMatch = useCallback(
    (text: string): boolean => {
      if (!text.trim()) return false;
      const hit = onSubmit(text);
      if (hit) {
        setValue('');
        setFlash('hit');
      }
      return hit;
    },
    [onSubmit],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setFlash(null);
      // Live mode: check each keystroke; only keep the text if it didn't match.
      if (live && tryMatch(text)) return;
      setValue(text);
    },
    [live, tryMatch],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!value.trim()) return;
      if (!tryMatch(value)) setFlash('miss');
    },
    [value, tryMatch],
  );

  return (
    <form className="play-input" onSubmit={handleSubmit}>
      <input
        className={flash ? `play-input__box play-input__box--${flash}` : 'play-input__box'}
        data-testid="play-input"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Type an answer…"
        value={value}
        disabled={disabled}
        onChange={handleChange}
      />
    </form>
  );
}
