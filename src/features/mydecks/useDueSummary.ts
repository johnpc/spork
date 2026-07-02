import { useQuery } from '@tanstack/react-query';
import { fetchDueSummary } from './dueSummaryApi';
import { useAuth } from '../auth/useAuth';

/** The signed-in user's cross-deck due summary (empty + idle when signed out). */
export function useDueSummary() {
  const { status } = useAuth();
  const enabled = status === 'authenticated';
  const query = useQuery({
    queryKey: ['due-summary'],
    queryFn: () => fetchDueSummary(),
    enabled,
    staleTime: 30_000,
  });
  return { summary: query.data ?? null, isLoading: enabled && query.isLoading };
}
