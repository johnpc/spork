import { useQuery } from '@tanstack/react-query';
import { currentGroups } from '../auth/authClient';

/** True when the signed-in user belongs to the 'editors' Cognito group. */
export function useIsEditor(): { isEditor: boolean; isLoading: boolean } {
  const query = useQuery({
    queryKey: ['auth-groups'],
    queryFn: currentGroups,
    staleTime: 5 * 60_000,
  });
  return {
    isEditor: (query.data ?? []).includes('editors'),
    isLoading: query.isLoading,
  };
}
