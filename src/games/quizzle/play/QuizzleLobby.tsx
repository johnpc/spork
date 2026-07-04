/** Lobby screen before a Quizzle session starts: explains the rules, shows
 * the best bank from this device, and launches the session. */
export function QuizzleLobby({
  total,
  startingBank,
  best,
  onStart,
}: {
  total: number;
  startingBank: number;
  best: number | null;
  onStart: () => void;
}) {
  return (
    <div className="quizzle__lobby">
      <p className="quizzle__how">
        Wager part of your bank on each of {total} questions. Answer right and your stake is{' '}
        <strong>added</strong>; wrong and it&rsquo;s <strong>lost</strong>. Bet big when
        you&rsquo;re sure.
      </p>
      {best != null && (
        <p className="sp-muted" data-testid="quizzle-best">
          Your best bank: {best}
        </p>
      )}
      <button className="quizzle__btn" data-testid="quizzle-start" onClick={onStart}>
        Start · bank {startingBank}
      </button>
    </div>
  );
}
