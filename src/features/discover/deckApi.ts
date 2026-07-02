/** Discover decks read: published decks in a category. Thin I/O — the shaping
 * (published-only, newest-first) lives in the pure composeDecks helper. */
import { dataClient, readAuthMode } from '../../lib/dataClient';
import { composeDecks, type DeckCardData } from './composeDecks';

export type { DeckCardData } from './composeDecks';

export async function fetchDecksByCategory(categorySlug: string): Promise<DeckCardData[]> {
  // QUERY the categorySlug GSI — never a filtered list() (that Scans the table
  // and gets slow + lossy as decks grow). The index is keyed to this category.
  const { data } = await dataClient.models.Deck.listDeckByCategorySlug(
    { categorySlug },
    { limit: 200, authMode: await readAuthMode() },
  );
  return composeDecks(data);
}
