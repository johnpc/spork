import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHistory } from 'react-router-dom';
import { findMyDeck, addMyDeck, removeMyDeck, type SaveDeckInput } from './myDecksApi';
import { useAuth } from '../auth/useAuth';

export type { SaveDeckInput } from './myDecksApi';

/** Add/remove toggle for one deck. Saving requires sign-in (owner authz). */
export function useDeckSave(input: SaveDeckInput) {
  const { status } = useAuth();
  const history = useHistory();
  const queryClient = useQueryClient();
  const enabled = status === 'authenticated';

  const savedQuery = useQuery({
    queryKey: ['my-deck', input.deckId],
    queryFn: () => findMyDeck(input.deckId),
    enabled,
    staleTime: 30_000,
  });
  const isSaved = !!savedQuery.data;

  const mutation = useMutation({
    mutationFn: () => (isSaved ? removeMyDeck(input.deckId) : addMyDeck(input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-deck', input.deckId] });
      await queryClient.invalidateQueries({ queryKey: ['my-decks'] });
    },
  });

  function toggle() {
    if (!enabled) {
      history.push('/signin'); // saving is per-user — require sign-in
      return;
    }
    mutation.mutate();
  }

  const busy = mutation.isPending || (enabled && savedQuery.isLoading);
  return { isSaved, toggle, busy };
}
