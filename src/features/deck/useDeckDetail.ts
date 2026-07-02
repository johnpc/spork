import { useQuery } from '@tanstack/react-query';
import { fetchDeckDetail } from './deckDetailApi';

export function useDeckDetail(deckId: string | undefined) {
  return useQuery({
    queryKey: ['deck-detail', deckId],
    queryFn: () => fetchDeckDetail(deckId as string),
    enabled: !!deckId,
  });
}
