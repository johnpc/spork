/** Reveal screen: shown when the player gives up (or solves). Displays ALL
 * clue answers (marking already-solved ones) + the hidden word + the quote.
 * Calm, informative, --sp-* tokens only. Matches the Wordle reveal pattern. */
export function AcrosticReveal({
  clues,
  solved,
  secret,
  quote,
  author,
  complete,
}: {
  clues: { clue: string; answer: string }[];
  solved: ReadonlySet<number>;
  secret: string;
  quote: string;
  author: string | null;
  complete: boolean;
}) {
  return (
    <div className="acrostic-reveal" data-testid="acrostic-reveal" role="status">
      {complete ? (
        <p className="acrostic__solved" data-testid="acrostic-solved">
          Solved! 🏆 The word was <strong>{secret}</strong>.
        </p>
      ) : (
        <p className="acrostic-reveal__header">
          The word was <strong>{secret}</strong>.
        </p>
      )}
      <blockquote className="secret__quote" data-testid="reveal-quote">
        <p>{quote}</p>
        {author && <footer data-testid="reveal-author">— {author}</footer>}
      </blockquote>
      <div className="acrostic-reveal__answers">
        <h3 className="acrostic-reveal__heading">Answers</h3>
        <ol className="acrostic-reveal__list">
          {clues.map((c, i) => {
            const wasSolved = solved.has(i);
            return (
              <li
                key={`${c.clue}-${i}`}
                className={
                  wasSolved
                    ? 'acrostic-reveal__item acrostic-reveal__item--solved'
                    : 'acrostic-reveal__item'
                }
                data-testid={wasSolved ? 'reveal-solved' : 'reveal-unsolved'}
              >
                <span className="acrostic-reveal__clue">{c.clue}</span>
                <span className="acrostic-reveal__answer">{c.answer.toUpperCase()}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
