/** Pure board-layout helpers for rendering the 8×8 chess board: the list of
 * squares (top rank first, for CSS grid order), the piece on a square, and the
 * unicode glyph for a piece. No React, no state — unit-tested directly. */
import type { BoardPiece } from './chess';

const FILES = 'abcdefgh';
export const BOARD_SIZE = 8;

// Use the SOLID glyph set for both colors — white vs black is shown by CSS fill
// (a hollow ♔ on a colored board reads as an unfilled black piece). The renderer
// adds chess-piece--w / --b, which colors + outlines them distinctly.
const SOLID: Record<string, string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

/** All 64 square names, rank 8 first then descending, each rank left→right —
 * natural reading order for a CSS grid. */
export function squares(): string[] {
  const out: string[] = [];
  for (let rank = BOARD_SIZE; rank >= 1; rank--) {
    for (let file = 0; file < BOARD_SIZE; file++) out.push(`${FILES[file]}${rank}`);
  }
  return out;
}

/** Is a square light? (a1 dark, like a real board.) */
export function isLightSquare(sq: string): boolean {
  return (FILES.indexOf(sq[0]) + Number(sq.slice(1))) % 2 === 0;
}

/** The piece on a square, or null. */
export function pieceAt(pieces: BoardPiece[], sq: string): BoardPiece | null {
  return pieces.find((p) => p.sq === sq) ?? null;
}

/** Unicode glyph for a piece (empty string if unknown). Always the solid set;
 * color is applied via CSS (chess-piece--w / --b). */
export function glyph(piece: BoardPiece): string {
  return SOLID[piece.type.toLowerCase()] ?? '';
}
