import { useQuery } from '@tanstack/react-query';
import { fetchConnectionsList } from '../play/connectionsApi';

export function useConnectionsList() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['connections-list'],
    queryFn: fetchConnectionsList,
  });
  return { puzzles: data ?? [], isLoading, isError, refetch };
}
