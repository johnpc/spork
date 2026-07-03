import { useQuery } from '@tanstack/react-query';
import { fetchPuzzles } from '../play/chessApi';

/** Load published ChessAttack puzzles for the Chess Attack home. */
export function useChessPuzzles() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['chess-list'],
    queryFn: fetchPuzzles,
  });
  return { puzzles: data ?? [], isLoading, isError, refetch };
}
