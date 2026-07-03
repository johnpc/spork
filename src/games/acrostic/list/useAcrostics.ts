import { useQuery } from '@tanstack/react-query';
import { fetchAcrostics } from '../play/acrosticApi';

/** Load published acrostics for the Acrostic home. */
export function useAcrostics() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['acrostics'],
    queryFn: fetchAcrostics,
  });
  return { acrostics: data ?? [], isLoading, isError, refetch };
}
