import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllDecks,
  createDeck,
  setDeckPublished,
  deleteDeck,
  type NewDeck,
} from './adminDeckApi';

/** The admin deck list + create/publish/delete mutations. */
export function useAdminDecks() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-decks'], queryFn: fetchAllDecks });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-decks'] });

  const create = useMutation({ mutationFn: (d: NewDeck) => createDeck(d), onSuccess: invalidate });
  const publish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      setDeckPublished(id, published),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: string) => deleteDeck(id), onSuccess: invalidate });

  return {
    decks: query.data ?? [],
    isLoading: query.isLoading,
    create: create.mutateAsync,
    setPublished: publish.mutate,
    remove: remove.mutate,
  };
}
