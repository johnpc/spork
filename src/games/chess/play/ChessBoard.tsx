import { squares, isLightSquare, pieceAt, glyph, BOARD_SIZE } from './board';
import type { BoardPiece } from './chess';

/** The 8×8 board: tappable squares with unicode glyphs. A tap calls `onTap(sq)`;
 * the hook decides select vs. move. The selected square is highlighted and legal
 * destinations get a dot. Rendering only — all logic lives in the hook. */
export function ChessBoard({
  pieces,
  selected,
  targets,
  onTap,
}: {
  pieces: BoardPiece[];
  selected: string | null;
  targets: string[];
  onTap: (sq: string) => void;
}) {
  const targetSet = new Set(targets);
  return (
    <div
      className="chess-board"
      data-testid="chess-board"
      style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
    >
      {squares().map((sq) => {
        const p = pieceAt(pieces, sq);
        const cls = [
          'chess-sq',
          isLightSquare(sq) ? 'chess-sq--light' : 'chess-sq--dark',
          selected === sq ? 'chess-sq--selected' : '',
          targetSet.has(sq) ? 'chess-sq--target' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button key={sq} className={cls} data-testid={`sq-${sq}`} onClick={() => onTap(sq)}>
            {p && (
              <span className={`chess-piece chess-piece--${p.color}`} data-testid={`piece-${sq}`}>
                {glyph(p)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
