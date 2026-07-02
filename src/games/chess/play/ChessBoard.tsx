import { squares, isLightSquare, pieceAt, glyph } from './board';
import type { Piece } from './chess';

/** The N×N board: a grid of tappable squares with unicode piece glyphs. A tap
 * anywhere calls `onTap(sq)`; the hook decides select vs. move. The selected
 * square is highlighted. Rendering only — all logic lives in the hook. */
export function ChessBoard({
  size,
  pieces,
  selected,
  onTap,
}: {
  size: number;
  pieces: Piece[];
  selected: string | null;
  onTap: (sq: string) => void;
}) {
  return (
    <div
      className="chess-board"
      data-testid="chess-board"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {squares(size).map((sq) => {
        const p = pieceAt(pieces, sq);
        const cls = [
          'chess-sq',
          isLightSquare(sq) ? 'chess-sq--light' : 'chess-sq--dark',
          selected === sq ? 'chess-sq--selected' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button key={sq} className={cls} data-testid={`sq-${sq}`} onClick={() => onTap(sq)}>
            {p && (
              <span className="chess-piece" data-testid={`piece-${sq}`}>
                {glyph(p)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
