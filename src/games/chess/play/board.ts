/** Pure board-layout helpers for rendering the small ChessAttack grid: the list
 * of squares (top rank first, for CSS grid order), the piece occupying a square,
 * and the unicode glyph for a piece. No React, no state — unit-tested directly. */
import type { Piece } from './chess';

const FILES = 'abcdefgh';

const GLYPHS: Record<string, string> = {
  wK: '♔',
  wQ: '♕',
  wR: '♖',
  wB: '♗',
  wN: '♘',
  wP: '♙',
  bK: '♚',
  bQ: '♛',
  bR: '♜',
  bB: '♝',
  bN: '♞',
  bP: '♟',
};

/** All square names for an N×N board, top rank (N) first then descending, each
 * rank left→right — i.e. natural reading order for a CSS grid. */
export function squares(size: number): string[] {
  const out: string[] = [];
  for (let rank = size; rank >= 1; rank--) {
    for (let file = 0; file < size; file++) out.push(`${FILES[file]}${rank}`);
  }
  return out;
}

/** Is a square light? (a1 dark, like a real board.) */
export function isLightSquare(sq: string): boolean {
  const file = FILES.indexOf(sq[0]);
  const rank = Number(sq.slice(1));
  return (file + rank) % 2 === 0;
}

/** The piece on a square, or null. */
export function pieceAt(pieces: Piece[], sq: string): Piece | null {
  return pieces.find((p) => p.sq === sq) ?? null;
}

/** Unicode glyph for a piece (empty string if unknown). */
export function glyph(piece: Piece): string {
  return GLYPHS[`${piece.side}${piece.piece.toUpperCase()}`] ?? '';
}
