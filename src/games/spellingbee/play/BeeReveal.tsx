/** End-of-game reveal: shows missed words + pangrams after player gives up. */

interface BeeRevealProps {
  answers: string[];
  found: string[];
  pangrams: string[];
}

export function BeeReveal({ answers, found, pangrams }: BeeRevealProps) {
  const missed = answers.filter((w) => !found.includes(w));
  const missedPangrams = pangrams.filter((w) => !found.includes(w));

  return (
    <div className="bee-reveal" data-testid="bee-reveal" role="status">
      <p className="sp-heading">
        You found {found.length} of {answers.length} words
      </p>
      {missedPangrams.length > 0 && (
        <div className="bee-reveal__pangrams" data-testid="bee-reveal-pangrams">
          <p className="sp-kicker">Missed Pangrams:</p>
          <ul>
            {missedPangrams.map((w) => (
              <li key={w}>{w.toUpperCase()}</li>
            ))}
          </ul>
        </div>
      )}
      {missed.length > 0 && (
        <div className="bee-reveal__missed" data-testid="bee-reveal-missed">
          <p className="sp-kicker">Other Missed Words:</p>
          <ul>
            {missed
              .filter((w) => !missedPangrams.includes(w))
              .map((w) => (
                <li key={w}>{w.toUpperCase()}</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
