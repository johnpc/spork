import { useState, useCallback, type FormEvent } from 'react';

interface PlayInputProps {
  /** Submit a guess; returns true on a fresh match (drives the flash + clear). */
  onSubmit: (guess: string) => boolean;
  disabled?: boolean;
}

/** Mode-shared guess box: type an answer, submit on Enter. On a correct fresh
 * match it clears (Sporcle behavior) and flashes; a miss keeps the text so the
 * player can fix a typo. Shared across every quiz mode — the map is just the
 * view above it. */
export function PlayInput({ onSubmit, disabled }: PlayInputProps) {
  const [value, setValue] = useState('');
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!value.trim()) return;
      const hit = onSubmit(value);
      setFlash(hit ? 'hit' : 'miss');
      if (hit) setValue('');
    },
    [value, onSubmit],
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
        onChange={(e) => {
          setValue(e.target.value);
          setFlash(null);
        }}
      />
    </form>
  );
}
