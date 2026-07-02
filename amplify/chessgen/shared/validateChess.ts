/**
 * Pure validator for a generated ChessAttack puzzle. An LLM proposes a board +
 * a solution line; we NEVER trust it. We INDEPENDENTLY replay the solution on
 * the board with the SAME pure engine the game uses (applyMove/splitMove/
 * pieceAt) and confirm every move mates a real piece and the FINAL move
 * captures the opposing king (the side NOT toMove). Only puzzles that legally
 * reach a king capture become fixtures. Pure → unit-tested without AWS.
 */
import {
  applyMove,
  splitMove,
  type Piece,
  type Position,
} from '../../../src/games/chess/play/chess';
import { pieceAt } from '../../../src/games/chess/play/board';
import { legalMove } from './legalMove';

export interface ChessCandidate {
  name: string;
  position: Position;
  solution: string[];
  movesToWin: number;
}

export interface Validated {
  ok: boolean;
  reason?: string;
  puzzle?: { name: string; position: Position; solution: string[]; movesToWin: number };
}

const SIZE = 5;
const FILES = 'abcde';

function onBoard(sq: string): boolean {
  return sq.length === 2 && FILES.includes(sq[0]) && sq[1] >= '1' && sq[1] <= '5';
}

function replay(pieces: Piece[], solution: string[], enemy: Position['toMove']): string | null {
  let board = pieces;
  for (let i = 0; i < solution.length; i++) {
    const parts = splitMove(solution[i]);
    if (!parts) return `move "${solution[i]}" malformed`;
    if (!onBoard(parts.from) || !onBoard(parts.to)) return `move "${solution[i]}" off board`;
    const mover = pieceAt(board, parts.from);
    if (!mover) return `no piece on ${parts.from} for "${solution[i]}"`;
    if (!legalMove(board, mover, parts.from, parts.to)) {
      return `illegal ${mover.piece} move "${solution[i]}"`;
    }
    const captured = pieceAt(board, parts.to);
    board = applyMove(board, solution[i]);
    if (i === solution.length - 1) {
      if (!captured || captured.piece.toUpperCase() !== 'K' || captured.side !== enemy) {
        return 'final move does not capture the opposing king';
      }
    }
  }
  return null;
}

/** Verify + normalize a candidate puzzle. */
export function validateChess(c: ChessCandidate): Validated {
  const p = c.position;
  if (!p || p.size !== SIZE) return { ok: false, reason: 'board must be 5x5' };
  if (p.pieces.length < 2 || p.pieces.length > 4) return { ok: false, reason: 'need 2–4 pieces' };
  for (const pc of p.pieces) {
    if (!onBoard(pc.sq)) return { ok: false, reason: `piece off board: ${pc.sq}` };
  }
  const squares = new Set(p.pieces.map((pc) => pc.sq));
  if (squares.size !== p.pieces.length) return { ok: false, reason: 'two pieces share a square' };
  const enemy = p.toMove === 'w' ? 'b' : 'w';
  const enemyKing = p.pieces.find((pc) => pc.side === enemy && pc.piece.toUpperCase() === 'K');
  if (!enemyKing) return { ok: false, reason: 'no opposing king to capture' };
  if (c.solution.length < 1) return { ok: false, reason: 'empty solution' };
  const failure = replay(p.pieces, c.solution, enemy);
  if (failure) return { ok: false, reason: failure };
  return {
    ok: true,
    puzzle: {
      name: c.name,
      position: p,
      solution: c.solution,
      movesToWin: c.solution.length,
    },
  };
}
