/**
 * Pure ChessAttack puzzle engine. This is a PUZZLE, not a chess engine — the
 * player follows a known solution. A move is "correct" iff its coordinate
 * string equals the NEXT expected move in the solution; applying it moves the
 * piece from→to (capturing any occupant). The puzzle is solved when every
 * solution move has been played. All pure + deterministic → unit-tested without
 * React or AWS.
 */

export type Side = 'w' | 'b';

export interface Piece {
  sq: string;
  piece: string; // R,N,B,Q,K,P (case as authored)
  side: Side;
}

export interface Position {
  size: number;
  pieces: Piece[];
  toMove: Side;
  goal: string;
}

/** Split a coordinate move like "c1c3" into its from/to squares. */
export function splitMove(move: string): { from: string; to: string } | null {
  const m = /^([a-z]\d+)([a-z]\d+)$/.exec(move.trim().toLowerCase());
  return m ? { from: m[1], to: m[2] } : null;
}

/** Apply a from→to move to the board: relocate the mover, remove any capture.
 * Unknown `from` squares leave the board unchanged (defensive; puzzles are
 * authored valid). Returns a NEW pieces array — never mutates the input. */
export function applyMove(pieces: Piece[], move: string): Piece[] {
  const parts = splitMove(move);
  if (!parts) return pieces;
  const mover = pieces.find((p) => p.sq === parts.from);
  if (!mover) return pieces;
  return pieces
    .filter((p) => p.sq !== parts.to && p.sq !== parts.from)
    .concat({ ...mover, sq: parts.to });
}

/** Does the player's move match the expected solution step at `index`? */
export function isExpectedMove(solution: string[], index: number, move: string): boolean {
  const expected = solution[index];
  return !!expected && expected.trim().toLowerCase() === move.trim().toLowerCase();
}

/** Solved when every solution move has been played. */
export function isSolved(solution: string[], playedCount: number): boolean {
  return solution.length > 0 && playedCount >= solution.length;
}
