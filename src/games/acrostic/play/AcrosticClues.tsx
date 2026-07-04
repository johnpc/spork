import { ClueInput } from './ClueInput';

/** The active clue list + give-up button for an in-progress acrostic. */
export function AcrosticClues({
  clues,
  solved,
  lastWrong,
  onGuess,
  onGiveUp,
}: {
  clues: { clue: string; answer: string }[];
  solved: ReadonlySet<number>;
  lastWrong: number | null;
  onGuess: (index: number, text: string, flagWrong?: boolean) => boolean;
  onGiveUp: () => void;
}) {
  return (
    <>
      <ol className="clue-list" data-testid="clue-list">
        {clues.map((c, i) => (
          <ClueInput
            key={`${c.clue}-${i}`}
            index={i}
            clue={c.clue}
            answer={c.answer}
            solved={solved.has(i)}
            wrong={lastWrong === i}
            onGuess={onGuess}
          />
        ))}
      </ol>
      <button className="acrostic__give-up-btn" data-testid="acrostic-give-up" onClick={onGiveUp}>
        Give up
      </button>
    </>
  );
}
