/** The honeycomb hive: 7 hex buttons (1 center + 6 outer). Clicking appends its
 * letter to the input. Pure presentational — parent holds the letters + callback. */
interface HiveProps {
  centerLetter: string;
  outerLetters: string[];
  onLetterClick: (letter: string) => void;
}

export function Hive({ centerLetter, outerLetters, onLetterClick }: HiveProps) {
  return (
    <div className="hive" data-testid="hive">
      <div className="hive__outer">
        {outerLetters.slice(0, 3).map((l, i) => (
          <button
            key={i}
            className="hive__hex"
            data-testid={`hex-${l}`}
            onClick={() => onLetterClick(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="hive__middle">
        {outerLetters[3] && (
          <button
            className="hive__hex"
            data-testid={`hex-${outerLetters[3]}`}
            onClick={() => onLetterClick(outerLetters[3])}
          >
            {outerLetters[3].toUpperCase()}
          </button>
        )}
        <button
          className="hive__hex hive__hex--center"
          data-testid={`hex-${centerLetter}`}
          data-center="true"
          onClick={() => onLetterClick(centerLetter)}
        >
          {centerLetter.toUpperCase()}
        </button>
        {outerLetters[4] && (
          <button
            className="hive__hex"
            data-testid={`hex-${outerLetters[4]}`}
            onClick={() => onLetterClick(outerLetters[4])}
          >
            {outerLetters[4].toUpperCase()}
          </button>
        )}
      </div>
      <div className="hive__outer">
        {outerLetters.slice(5, 6).map((l, i) => (
          <button
            key={i}
            className="hive__hex"
            data-testid={`hex-${l}`}
            onClick={() => onLetterClick(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
