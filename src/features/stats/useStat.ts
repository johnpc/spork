import { useQuery } from '@tanstack/react-query';
import { fetchStat } from './statApi';
import { useAuth } from '../auth/useAuth';

/** The signed-in user's study stat (streak/totals), or null when none/signed out. */
export function useStat() {
  const { status } = useAuth();
  const enabled = status === 'authenticated';
  const query = useQuery({
    queryKey: ['user-stat'],
    queryFn: fetchStat,
    enabled,
    staleTime: 30_000,
  });
  return { stat: query.data ?? null, isLoading: enabled && query.isLoading };
}
