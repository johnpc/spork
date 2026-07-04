/** Helper for resetting puzzle state. Extracted to keep useChessAttack ≤100 lines. */
export interface PuzzleState {
  fen: string;
  ply: number;
  selected: string | null;
  wrong: boolean;
  solved: boolean;
  gaveUp: boolean;
}

export function initialState(startFen: string): PuzzleState {
  return {
    fen: startFen,
    ply: 0,
    selected: null,
    wrong: false,
    solved: false,
    gaveUp: false,
  };
}
