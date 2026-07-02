/**
 * Pure chess move-legality check for the ChessAttack validator. The play engine
 * (applyMove) blindly relocates a piece from→to, so on its own it will "capture"
 * a king with a geometrically IMPOSSIBLE move (a rook moving diagonally, a piece
 * jumping over a blocker, a knight sliding like a bishop). This module is the
 * missing guard: given the current board it confirms a move obeys the moving
 * piece's real movement rules — right shape AND, for sliders, a clear path — so
 * the validator only accepts puzzles a chess-literate player could actually play.
 */
import type { Piece } from '../../../src/games/chess/play/chess';
import { pieceAt } from '../../../src/games/chess/play/board';

const FILE = (sq: string): number => sq.charCodeAt(0) - 97; // a→0
const RANK = (sq: string): number => Number(sq.slice(1)) - 1; // 1→0

interface Delta {
  df: number;
  dr: number;
  adf: number;
  adr: number;
  straight: boolean;
  diagonal: boolean;
}

/** Every square strictly between two squares along a rank/file/diagonal (empty
 * for adjacent or non-linear pairs). Used to enforce slider path-blocking. */
function between(from: string, to: string): string[] {
  const steps = Math.max(Math.abs(FILE(to) - FILE(from)), Math.abs(RANK(to) - RANK(from)));
  const sf = Math.sign(FILE(to) - FILE(from));
  const sr = Math.sign(RANK(to) - RANK(from));
  const out: string[] = [];
  for (let i = 1; i < steps; i++) {
    out.push(`${String.fromCharCode(97 + FILE(from) + sf * i)}${RANK(from) + sr * i + 1}`);
  }
  return out;
}

const clear = (board: Piece[], from: string, to: string): boolean =>
  between(from, to).every((sq) => !pieceAt(board, sq));

/** Right shape for the piece (ignoring board occupancy/path). */
function rightShape(board: Piece[], p: Piece, from: string, to: string, d: Delta): boolean {
  switch (p.piece.toUpperCase()) {
    case 'R':
      return d.straight && clear(board, from, to);
    case 'B':
      return d.diagonal && clear(board, from, to);
    case 'Q':
      return (d.straight || d.diagonal) && clear(board, from, to);
    case 'N':
      return (d.adf === 1 && d.adr === 2) || (d.adf === 2 && d.adr === 1);
    case 'K':
      return d.adf <= 1 && d.adr <= 1;
    case 'P':
      return pawn(p, d, !!pieceAt(board, to));
    default:
      return false;
  }
}

/** Pawn: quiet push one square forward onto empty, or diagonal one square to a foe. */
function pawn(p: Piece, d: Delta, capture: boolean): boolean {
  const dir = p.side === 'w' ? 1 : -1;
  if (d.adf === 1 && d.dr === dir) return capture;
  return d.df === 0 && d.dr === dir && !capture;
}

/** Is `move` legal for `mover` on `board`? Geometry per piece + path for sliders. */
export function legalMove(board: Piece[], mover: Piece, from: string, to: string): boolean {
  if (from === to) return false;
  const occupant = pieceAt(board, to);
  if (occupant && occupant.side === mover.side) return false;
  const df = FILE(to) - FILE(from);
  const dr = RANK(to) - RANK(from);
  const adf = Math.abs(df);
  const adr = Math.abs(dr);
  const d: Delta = { df, dr, adf, adr, straight: df === 0 || dr === 0, diagonal: adf === adr };
  return rightShape(board, mover, from, to, d);
}
