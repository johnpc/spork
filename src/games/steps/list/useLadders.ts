import { useQuery } from '@tanstack/react-query';
import { fetchLadders } from '../play/ladderApi';

/** Load published word ladders for the Steps home. */
export function useLadders() {
  const { data, isLoading } = useQuery({ queryKey: ['ladders'], queryFn: fetchLadders });
  return { ladders: data ?? [], isLoading };
}
