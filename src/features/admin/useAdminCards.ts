import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeckDetail } from '../deck/deckDetailApi';
import { addCard, updateCard, deleteCard, setCardOrder, type CardInput } from './adminCardApi';
import { regenerateCardMedia } from './generateApi';
import { reorderCards } from './reorderCards';
import type { CardRecord } from '../../lib/dataClient';

/** A deck's cards (admin view) + add/edit/delete/reorder mutations. */
export function useAdminCards(deckId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['admin-cards', deckId],
    queryFn: () => fetchDeckDetail(deckId as string),
    enabled: !!deckId,
  });
  const cards = query.data?.cards ?? [];
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-cards', deckId] });

  const add = useMutation({
    mutationFn: (input: CardInput) => addCard(deckId as string, nextOrd(cards), input),
    onSuccess: invalidate,
  });
  const edit = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CardInput }) => updateCard(id, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteCard(deckId as string, id),
    onSuccess: invalidate,
  });
  const move = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const changes = reorderCards(cards, id, direction);
      await Promise.all(changes.map((c) => setCardOrder(c.id, c.ord)));
    },
    onSuccess: invalidate,
  });
  const regen = useMutation({
    mutationFn: ({ id, kind }: { id: string; kind: 'image' | 'audio' }) =>
      regenerateCardMedia(id, kind),
    onSuccess: invalidate,
  });

  return {
    deck: query.data?.deck ?? null,
    cards,
    isLoading: query.isLoading,
    add: add.mutateAsync,
    edit: edit.mutate,
    remove: remove.mutate,
    move: move.mutate,
    regenerate: regen.mutate,
  };
}

/** Next ordinal = one past the current max (0 for an empty deck). */
function nextOrd(cards: CardRecord[]): number {
  return cards.reduce((max, c) => Math.max(max, c.ord + 1), 0);
}
