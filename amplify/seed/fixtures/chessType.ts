/** Shape of a seeded ChessAttack puzzle — DATA (gate-exempt). Shared by the
 * hand-authored fixture (chess.ts) and the seed runner. `position` + `solution`
 * are pre-stringified JSON, ready to write straight to the model's string
 * fields. */
export interface ChessFixture {
  name: string;
  position: string; // JSON {size, pieces:[{sq,piece,side}], toMove, goal}
  solution: string; // JSON string[] of coordinate moves, e.g. ["a1a5"]
  movesToWin: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}
