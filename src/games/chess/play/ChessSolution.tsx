/** Reveals the full solution line when the player gives up. Displays the UCI
 * moves in a calm, readable format. Matches the Wordle reveal convention. */
interface ChessSolutionProps {
  line: string[];
  gaveUp: boolean;
}

export function ChessSolution({ line, gaveUp }: ChessSolutionProps) {
  if (!gaveUp) return null;

  // Convert UCI moves to a readable format: e8e1 → e8-e1
  const moves = line.map((uci) => {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promo = uci.slice(4);
    return promo ? `${from}-${to}=${promo}` : `${from}-${to}`;
  });

  return (
    <div className="chess__solution" data-testid="chess-solution" role="status">
      <p className="sp-muted">
        Solution: <strong>{moves.join(', ')}</strong>
      </p>
    </div>
  );
}
