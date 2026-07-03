/**
 * The pure select-then-move interaction decision for the chess board: given a
 * tapped square, the current selection, and whether the solver owns a piece on
 * that square, decide what happens. Kept out of chess.ts (move engine) and the
 * hook so the branching is unit-tested on its own and the hook stays low-CRAP.
 */
export type TapAction =
  | { kind: 'ignore' }
  | { kind: 'select'; sq: string }
  | { kind: 'deselect' }
  | { kind: 'move'; from: string; to: string };

export function tapAction(sq: string, selected: string | null, ownPieceHere: boolean): TapAction {
  if (selected === null) return ownPieceHere ? { kind: 'select', sq } : { kind: 'ignore' };
  if (sq === selected) return { kind: 'deselect' };
  if (ownPieceHere) return { kind: 'select', sq }; // reselect a different own piece
  return { kind: 'move', from: selected, to: sq };
}
