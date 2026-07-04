import { scoreGuess } from './scoring';
import './wordle.css';

interface Props {
  guesses: string[];
  current: string;
  answer: string;
  wordLength: number;
  maxGuesses: number;
}

/** Renders the Wordle board grid with colored tiles for each guess. */
export function WordleBoard({ guesses, current, answer, wordLength, maxGuesses }: Props) {
  const rows = [];

  // Past guesses (scored)
  for (let i = 0; i < guesses.length; i++) {
    const results = scoreGuess(guesses[i], answer);
    rows.push(
      <div key={`guess-${i}`} className="wordle-board__row" data-testid="wordle-row">
        {results.map((r, j) => (
          <div
            key={j}
            className={`wordle-board__tile wordle-board__tile--${r.result}`}
            data-testid={`wordle-tile-${i}-${j}`}
          >
            {r.letter.toUpperCase()}
          </div>
        ))}
      </div>,
    );
  }

  // Current input row (if game not over)
  if (guesses.length < maxGuesses) {
    const tiles = [];
    for (let j = 0; j < wordLength; j++) {
      tiles.push(
        <div
          key={j}
          className="wordle-board__tile wordle-board__tile--empty"
          data-testid={`wordle-tile-${guesses.length}-${j}`}
        >
          {current[j] ? current[j].toUpperCase() : ''}
        </div>,
      );
    }
    rows.push(
      <div key="current" className="wordle-board__row" data-testid="wordle-row">
        {tiles}
      </div>,
    );
  }

  // Empty rows
  const emptyCount = maxGuesses - rows.length;
  for (let i = 0; i < emptyCount; i++) {
    const tiles = [];
    for (let j = 0; j < wordLength; j++) {
      tiles.push(<div key={j} className="wordle-board__tile wordle-board__tile--empty" />);
    }
    rows.push(
      <div key={`empty-${i}`} className="wordle-board__row">
        {tiles}
      </div>,
    );
  }

  return (
    <div className="wordle-board" data-testid="wordle-board">
      {rows}
    </div>
  );
}
