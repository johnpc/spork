import { useEffect, useMemo } from 'react';
import { scoreGuess, type LetterResult } from './scoring';
import './wordle.css';

interface Props {
  guesses: string[];
  answer: string;
  onType: (letter: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  disabled: boolean;
}

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

/** On-screen QWERTY keyboard with letter state coloring. Also wires physical keyboard. */
export function WordleKeyboard({ guesses, answer, onType, onBackspace, onEnter, disabled }: Props) {
  // Compute best-known result for each letter across all guesses
  const letterStates = useMemo(() => {
    const states: Record<string, LetterResult> = {};
    for (const guess of guesses) {
      const results = scoreGuess(guess, answer);
      results.forEach((r) => {
        const current = states[r.letter];
        // correct > present > absent
        if (r.result === 'correct' || (!current && r.result === 'present')) {
          states[r.letter] = r.result;
        } else if (!current) {
          states[r.letter] = r.result;
        }
      });
    }
    return states;
  }, [guesses, answer]);

  // Wire physical keyboard
  useEffect(() => {
    if (disabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onEnter();
      } else if (e.key === 'Backspace') {
        onBackspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        onType(e.key.toLowerCase());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [disabled, onType, onBackspace, onEnter]);

  return (
    <div className="wordle-keyboard" data-testid="wordle-keyboard">
      {ROWS.map((row, i) => (
        <div key={i} className="wordle-keyboard__row">
          {i === 2 && (
            <button
              className="wordle-keyboard__key wordle-keyboard__key--wide"
              onClick={onEnter}
              disabled={disabled}
              data-testid="wordle-key-enter"
            >
              Enter
            </button>
          )}
          {row.map((letter) => {
            const state = letterStates[letter];
            return (
              <button
                key={letter}
                className={`wordle-keyboard__key ${state ? `wordle-keyboard__key--${state}` : ''}`}
                onClick={() => onType(letter)}
                disabled={disabled}
                data-testid={`wordle-key-${letter}`}
              >
                {letter.toUpperCase()}
              </button>
            );
          })}
          {i === 2 && (
            <button
              className="wordle-keyboard__key wordle-keyboard__key--wide"
              onClick={onBackspace}
              disabled={disabled}
              data-testid="wordle-key-backspace"
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
