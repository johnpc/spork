/**
 * ChessAttack engine — real chess via chess.js. A puzzle is a FEN plus a solver
 * UCI line (odd plies = the solver's forced moves, even plies = the defender's
 * only-good replies). The player makes the solver moves; the defender's reply is
 * auto-played from the line. Solved when the position is checkmate. All logic is
 * pure over a chess.js instance so the hook stays a thin view.
 */
import { Chess, type Square } from 'chess.js';

export type Side = 'w' | 'b';

export interface BoardPiece {
  sq: string; // e.g. "e4"
  type: string; // p,n,b,r,q,k
  color: Side;
}

/** A new Chess at `fen`, or null if the FEN is invalid. */
export function safeGame(fen: string): Chess | null {
  try {
    return new Chess(fen);
  } catch {
    return null;
  }
}

/** The occupied squares of a FEN, for rendering. */
export function boardFromFen(fen: string): BoardPiece[] {
  const g = safeGame(fen);
  if (!g) return [];
  const out: BoardPiece[] = [];
  for (const row of g.board()) {
    for (const cell of row) {
      if (cell) out.push({ sq: cell.square, type: cell.type, color: cell.color });
    }
  }
  return out;
}

/** Whose turn it is in this FEN ('w'/'b'), or 'w' if invalid. */
export function turnOf(fen: string): Side {
  return safeGame(fen)?.turn() ?? 'w';
}

/** Legal destination squares for the piece on `from` (empty if none/illegal). */
export function legalTargets(fen: string, from: string): string[] {
  const g = safeGame(fen);
  if (!g) return [];
  return g.moves({ square: from as Square, verbose: true }).map((m) => m.to);
}

export interface MoveResult {
  fen: string; // position after the move (+ auto-played defender reply)
  ok: boolean; // was the player's move the expected solver move?
  solved: boolean; // checkmate reached
}

/** Attempt the solver's move from→to at ply `index`. If it matches the expected
 * solver move, apply it AND auto-play the defender's reply (the next line
 * entry), returning the resulting FEN. A wrong move is rejected (ok:false),
 * position unchanged. */
export function playSolverMove(
  fen: string,
  line: string[],
  index: number,
  from: string,
  to: string,
): MoveResult {
  const expected = line[index];
  if (!expected || expected.slice(0, 4) !== `${from}${to}`)
    return { fen, ok: false, solved: false };
  const g = safeGame(fen);
  if (!g || !applyUci(g, expected)) return { fen, ok: false, solved: false };
  if (g.isCheckmate()) return { fen: g.fen(), ok: true, solved: true };
  const reply = line[index + 1];
  if (reply) applyUci(g, reply);
  return { fen: g.fen(), ok: true, solved: g.isCheckmate() };
}

/** Apply a UCI move (optional promotion) to a game; false if illegal. */
function applyUci(g: Chess, uci: string): boolean {
  try {
    return !!g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4) || 'q' });
  } catch {
    return false;
  }
}
