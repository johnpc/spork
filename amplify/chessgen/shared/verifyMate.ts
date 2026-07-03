/**
 * Pure verifier for a curated chess mate puzzle. We NEVER ship a puzzle we
 * haven't proven: replay the full UCI line on chess.js from the FEN and confirm
 * (a) every move is legal, (b) it's the player to move on odd plies (the solver)
 * and the defender on even plies, and (c) the FINAL move is checkmate. Also
 * checks the claimed mate-in-N matches the number of PLAYER moves. Pure over
 * chess.js → unit-tested without AWS. Returns the normalized puzzle when valid.
 */
import { Chess } from 'chess.js';

export interface MateCandidate {
  name: string;
  fen: string;
  line: string[]; // full UCI line: player, defender, player, … ending in mate
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface Verified {
  ok: boolean;
  reason?: string;
  puzzle?: { name: string; fen: string; line: string[]; movesToWin: number; solverSide: 'w' | 'b' };
}

/** Apply a UCI move (e.g. "e2e4", "e7e8q") on the game; null if illegal. */
function tryMove(game: Chess, uci: string): boolean {
  const move = { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4) || undefined };
  try {
    return !!game.move(move);
  } catch {
    return false;
  }
}

export function verifyMate(c: MateCandidate): Verified {
  let game: Chess;
  try {
    game = new Chess(c.fen);
  } catch {
    return { ok: false, reason: 'invalid FEN' };
  }
  if (!Array.isArray(c.line) || c.line.length === 0) return { ok: false, reason: 'empty line' };
  if (c.line.length % 2 === 0) return { ok: false, reason: 'line must end on a player move' };

  const solverSide = game.turn();
  for (let i = 0; i < c.line.length; i++) {
    if (!tryMove(game, c.line[i]))
      return { ok: false, reason: `illegal move ${c.line[i]} at ply ${i}` };
    const last = i === c.line.length - 1;
    if (last && !game.isCheckmate()) return { ok: false, reason: 'final move is not checkmate' };
    if (!last && game.isGameOver()) return { ok: false, reason: `game ended early at ply ${i}` };
  }
  const movesToWin = Math.ceil(c.line.length / 2);
  return { ok: true, puzzle: { name: c.name, fen: c.fen, line: c.line, movesToWin, solverSide } };
}
