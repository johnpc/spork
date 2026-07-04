import { useQuery } from '@tanstack/react-query';
import { fetchBees } from '../play/beeApi';

/** Hook: all published Spelling Bee puzzles. */
export function useBees() {
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['bees'],
    queryFn: fetchBees,
  });
  return { bees: data, isLoading, isError, refetch };
}
