/** react-query hook for a category's published decks. */
import { useQuery } from '@tanstack/react-query';
import { fetchDecksByCategory } from './deckApi';

export function useDecks(categorySlug: string | undefined) {
  return useQuery({
    queryKey: ['decks', categorySlug],
    queryFn: () => fetchDecksByCategory(categorySlug as string),
    enabled: !!categorySlug,
  });
}
