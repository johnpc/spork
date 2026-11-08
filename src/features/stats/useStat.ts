import { useQuery } from '@tanstack/react-query';
import { fetchStat, flushPending } from './statApi';
import { loadPending } from './pendingSessions';
import { projectStat, type StatLike } from './applySession';
import { useAuth } from '../auth/useAuth';

/** Replay any unconfirmed sessions (best-effort), then read the server stat. */
async function fetchFlushed(owner: string) {
  if (loadPending(owner).length) await flushPending(owner).catch(() => {});
  return fetchStat();
}

/**
 * The signed-in user's study stat (streak/totals), or null when none/signed out.
 * Sessions still in the local outbox are overlaid on the server stat, so a
 * streak earned just before a reload shows immediately — even offline.
 */
export function useStat(): { stat: StatLike | null; isLoading: boolean } {
  const { status, email } = useAuth();
  const enabled = status === 'authenticated' && !!email;
  const query = useQuery({
    queryKey: ['user-stat'],
    queryFn: () => fetchFlushed(email ?? ''),
    enabled,
    staleTime: 30_000,
  });
  const pending = enabled && email ? loadPending(email) : [];
  return {
    stat: projectStat(query.data ?? null, pending),
    isLoading: enabled && query.isLoading,
  };
}
