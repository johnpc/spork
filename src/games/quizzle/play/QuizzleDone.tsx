/** End-of-session screen: final bank vs the starting bank, plus the best bank
 * saved on this device. Purely presentational. */
export function QuizzleDone({
  bank,
  startingBank,
  best,
}: {
  bank: number;
  startingBank: number;
  best: number | null;
}) {
  const delta = bank - startingBank;
  const verdict =
    delta > 0
      ? 'You came out ahead! 🏆'
      : delta < 0
        ? 'The house won this time.'
        : 'You broke even.';
  return (
    <div className="quizzle__done" data-testid="quizzle-done">
      <p className="quizzle__final" data-testid="quizzle-final-bank">
        Final bank: <strong>{bank}</strong>
      </p>
      <p className="sp-muted">
        Started with {startingBank} · {delta >= 0 ? '+' : ''}
        {delta}
      </p>
      <p className="quizzle__verdict">{verdict}</p>
      {best != null && (
        <p className="sp-muted" data-testid="quizzle-best">
          Best on this device: {best}
        </p>
      )}
    </div>
  );
}
