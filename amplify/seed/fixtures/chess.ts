/** Hand-authored, engine-valid ChessAttack puzzles on a 5×5 board. Committed so
 * the seed is deterministic. Each `solution` is a list of coordinate moves the
 * player must reproduce (the play engine follows the solution — it does not
 * enforce full chess legality). DATA (gate-exempt). */
import type { ChessFixture } from './chessType';

export const seedChessPuzzles: ChessFixture[] = [
  {
    // White rook slides up the open a-file and captures the black king.
    name: 'Rook Takes All',
    position: JSON.stringify({
      size: 5,
      pieces: [
        { sq: 'a1', piece: 'R', side: 'w' },
        { sq: 'a5', piece: 'K', side: 'b' },
      ],
      toMove: 'w',
      goal: 'Capture the black king in one move',
    }),
    solution: JSON.stringify(['a1a5']),
    movesToWin: 1,
    difficulty: 'EASY',
  },
  {
    // White queen slides up the open c-file and captures the black king.
    name: 'Queen Strike',
    position: JSON.stringify({
      size: 5,
      pieces: [
        { sq: 'c1', piece: 'Q', side: 'w' },
        { sq: 'c5', piece: 'K', side: 'b' },
        { sq: 'e5', piece: 'P', side: 'b' },
      ],
      toMove: 'w',
      goal: 'Capture the black king in one move',
    }),
    solution: JSON.stringify(['c1c5']),
    movesToWin: 1,
    difficulty: 'EASY',
  },
  {
    // Rook first captures the blocking pawn on a5, then sweeps the 5th rank to
    // capture the black king on e5.
    name: 'Clear the Rank',
    position: JSON.stringify({
      size: 5,
      pieces: [
        { sq: 'a1', piece: 'R', side: 'w' },
        { sq: 'a5', piece: 'P', side: 'b' },
        { sq: 'e5', piece: 'K', side: 'b' },
      ],
      toMove: 'w',
      goal: 'Capture the black king in two moves',
    }),
    solution: JSON.stringify(['a1a5', 'a5e5']),
    movesToWin: 2,
    difficulty: 'MEDIUM',
  },
];
