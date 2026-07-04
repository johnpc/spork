/** Reveal a valid solution path after the player gives up. Calm informative
 * reveal (matches Wordle's "The word was CRANE"), using only design tokens. */
interface StepsSolutionProps {
  parPath: string[];
}

export function StepsSolution({ parPath }: StepsSolutionProps) {
  return (
    <div className="steps__solution" data-testid="steps-solution" role="status">
      <p className="sp-muted">One valid solution:</p>
      <ol className="steps__solution-path">
        {parPath.map((word, i) => (
          <li key={`${word}-${i}`} className="steps__solution-word">
            {word.toUpperCase()}
          </li>
        ))}
      </ol>
    </div>
  );
}
