import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPuzzle } from './chessApi';
import { parsePosition, parseSolution } from './parseChess';
import { applyMove, isExpectedMove, isSolved } from './chess';
import { pieceAt } from './board';

/**
 * ChessAttack play engine: load the puzzle, hold the live board + how many
 * solution moves have been played, and drive a select-piece-then-pick-target
 * interaction. A tap on the player's piece selects it; a tap on a destination
 * attempts from→to. The move is accepted iff it matches the next solution step;
 * a wrong move sets a "try again" flag. Pure logic lives in chess/chessState.
 */
export function useChessAttack(id: string | undefined) {
  const { data: puzzle, isLoading } = useQuery({
    queryKey: ['chess', id],
    queryFn: () => fetchPuzzle(id as string),
    enabled: !!id,
  });

  const position = useMemo(() => parsePosition(puzzle?.position), [puzzle]);
  const solution = useMemo(() => parseSolution(puzzle?.solution), [puzzle]);

  const [pieces, setPieces] = useState(position.pieces);
  const [played, setPlayed] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);

  // Re-sync when the loaded puzzle changes (query resolves after first render).
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (puzzle && puzzle.id !== loadedId) {
    setLoadedId(puzzle.id);
    setPieces(position.pieces);
    setPlayed(0);
    setSelected(null);
    setWrong(false);
  }

  const solved = isSolved(solution, played);

  const tap = useCallback(
    (sq: string) => {
      if (solved) return;
      if (selected === null) {
        const p = pieceAt(pieces, sq);
        if (p && p.side === position.toMove) setSelected(sq);
        return;
      }
      if (sq === selected) return setSelected(null);
      const move = `${selected}${sq}`;
      if (isExpectedMove(solution, played, move)) {
        setPieces((p) => applyMove(p, move));
        setPlayed((n) => n + 1);
        setWrong(false);
      } else setWrong(true);
      setSelected(null);
    },
    [solved, selected, pieces, position.toMove, solution, played],
  );

  const reset = useCallback(() => {
    setPieces(position.pieces);
    setPlayed(0);
    setSelected(null);
    setWrong(false);
  }, [position.pieces]);

  return {
    puzzle: puzzle ?? null,
    isLoading: !!id && isLoading,
    size: position.size,
    goal: position.goal,
    pieces,
    selected,
    wrong,
    solved,
    moves: played,
    total: solution.length,
    tap,
    reset,
  };
}
