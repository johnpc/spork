import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPuzzle } from './chessApi';
import { parseFen, parseSolution } from './parseChess';
import { boardFromFen, legalTargets, playSolverMove, turnOf } from './chess';
import { tapAction } from './tapAction';
import { initialState } from './resetPuzzle';

/**
 * ChessAttack play engine (real chess via chess.js). Load the puzzle (FEN + a
 * solver UCI line), hold the live FEN + ply index, and drive a
 * select-piece-then-pick-target interaction. A correct solver move is applied
 * and the defender's forced reply auto-plays; a wrong move flashes "try again".
 * Solved when the position is checkmate.
 */
export function useChessAttack(id: string | undefined) {
  const {
    data: puzzle,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['chess', id],
    queryFn: () => fetchPuzzle(id as string),
    enabled: !!id,
  });

  const startFen = useMemo(() => parseFen(puzzle?.position), [puzzle]);
  const line = useMemo(() => parseSolution(puzzle?.solution), [puzzle]);
  const total = puzzle?.movesToWin ?? Math.ceil(line.length / 2);
  const solverSide = turnOf(startFen);

  const [state, setState] = useState(() => initialState(startFen));
  const { fen, ply, selected, wrong, solved, gaveUp } = state;

  // Re-sync when the loaded puzzle changes (query resolves after first render).
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (puzzle && puzzle.id !== loadedId) {
    setLoadedId(puzzle.id);
    setState(initialState(startFen));
  }

  const pieces = useMemo(() => boardFromFen(fen), [fen]);
  const targets = useMemo(() => (selected ? legalTargets(fen, selected) : []), [fen, selected]);

  const tap = useCallback(
    (sq: string) => {
      if (solved) return;
      const ownHere = pieces.some((p) => p.sq === sq && p.color === solverSide);
      const action = tapAction(sq, selected, ownHere);
      if (action.kind === 'select') return setState((s) => ({ ...s, selected: action.sq }));
      if (action.kind === 'deselect') return setState((s) => ({ ...s, selected: null }));
      if (action.kind === 'ignore') return;
      const r = playSolverMove(fen, line, ply, action.from, action.to);
      setState((s) =>
        r.ok
          ? { ...s, fen: r.fen, ply: s.ply + 2, solved: r.solved, wrong: false, selected: null }
          : { ...s, wrong: true, selected: null },
      );
    },
    [solved, pieces, selected, solverSide, fen, line, ply],
  );

  const reset = useCallback(() => setState(initialState(startFen)), [startFen]);
  const giveUp = useCallback(() => setState((s) => ({ ...s, gaveUp: true })), []);

  return {
    puzzle: puzzle ?? null,
    isLoading: !!id && isLoading,
    isError,
    refetch,
    fen,
    pieces,
    selected,
    targets,
    solverSide,
    wrong,
    solved,
    gaveUp,
    line,
    moves: Math.floor(ply / 2),
    total,
    tap,
    reset,
    giveUp,
  };
}
