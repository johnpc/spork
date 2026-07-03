import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPuzzle } from './chessApi';
import { parseFen, parseSolution } from './parseChess';
import { boardFromFen, legalTargets, playSolverMove, turnOf } from './chess';
import { tapAction } from './tapAction';

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

  const [fen, setFen] = useState(startFen);
  const [ply, setPly] = useState(0); // index into `line` (solver plies are even)
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);
  const [solved, setSolved] = useState(false);

  // Re-sync when the loaded puzzle changes (query resolves after first render).
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (puzzle && puzzle.id !== loadedId) {
    setLoadedId(puzzle.id);
    setFen(startFen);
    setPly(0);
    setSelected(null);
    setWrong(false);
    setSolved(false);
  }

  const pieces = useMemo(() => boardFromFen(fen), [fen]);
  const targets = useMemo(() => (selected ? legalTargets(fen, selected) : []), [fen, selected]);

  const tap = useCallback(
    (sq: string) => {
      if (solved) return;
      const ownHere = pieces.some((p) => p.sq === sq && p.color === solverSide);
      const action = tapAction(sq, selected, ownHere);
      if (action.kind === 'select') return setSelected(action.sq);
      if (action.kind === 'deselect') return setSelected(null);
      if (action.kind === 'ignore') return;
      const r = playSolverMove(fen, line, ply, action.from, action.to);
      if (r.ok) {
        setFen(r.fen);
        setPly((n) => n + 2); // advance past solver + defender ply
        setSolved(r.solved);
        setWrong(false);
      } else setWrong(true);
      setSelected(null);
    },
    [solved, pieces, selected, solverSide, fen, line, ply],
  );

  const reset = useCallback(() => {
    setFen(startFen);
    setPly(0);
    setSelected(null);
    setWrong(false);
    setSolved(false);
  }, [startFen]);

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
    moves: Math.floor(ply / 2),
    total,
    tap,
    reset,
  };
}
