/** Shape of a seeded ChessAttack puzzle — DATA (gate-exempt). Shared by the
 * generated fixture (chess.ts) and the seed runner. `position` is a FEN;
 * `solution` is a JSON UCI line (solver + defender plies), ready to write
 * straight to the model's string fields. */
export interface ChessFixture {
  name: string;
  position: string; // FEN, e.g. "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1"
  solution: string; // JSON UCI line, e.g. ["e8e1","g1f2","e1f1"]
  movesToWin: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}
