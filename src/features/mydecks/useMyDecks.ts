import { useQuery } from '@tanstack/react-query';
import { fetchMyDecks } from './myDecksApi';
import { useAuth } from '../auth/useAuth';

/** The signed-in user's saved decks (empty + idle when not authenticated). */
export function useMyDecks() {
  const { status } = useAuth();
  const enabled = status === 'authenticated';
  const query = useQuery({
    queryKey: ['my-decks'],
    queryFn: fetchMyDecks,
    enabled,
    staleTime: 30_000,
  });
  return {
    decks: query.data ?? [],
    isLoading: enabled && query.isLoading,
    isAuthenticated: enabled,
  };
}
