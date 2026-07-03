import { useQuery } from '@tanstack/react-query';
import { fetchLadders } from '../play/ladderApi';

/** Load published word ladders for the Steps home. */
export function useLadders() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ladders'],
    queryFn: fetchLadders,
  });
  return { ladders: data ?? [], isLoading, isError, refetch };
}
