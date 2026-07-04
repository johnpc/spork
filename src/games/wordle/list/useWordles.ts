import { useQuery } from '@tanstack/react-query';
import { fetchWordles } from '../play/wordleApi';

/** Load published Wordle puzzles for the list screen. */
export function useWordles() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['wordles'],
    queryFn: fetchWordles,
  });
  return { puzzles: data ?? [], isLoading, isError, refetch };
}
