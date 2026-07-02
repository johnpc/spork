/** Deck-detail read: one deck + its cards (ordered). Guest-readable. */
import { dataClient, readAuthMode, type DeckRecord, type CardRecord } from '../../lib/dataClient';

export interface DeckDetail {
  deck: DeckRecord;
  cards: CardRecord[];
}

export async function fetchDeckDetail(deckId: string): Promise<DeckDetail | null> {
  const authMode = await readAuthMode();
  const { data: deck } = await dataClient.models.Deck.get({ id: deckId }, { authMode });
  if (!deck) return null;
  // Query cards by the deckId(ord) GSI — ordered, single-partition (no Scan).
  const { data: cards } = await dataClient.models.Card.listCardByDeckIdAndOrd(
    { deckId },
    { limit: 500, authMode },
  );
  return { deck, cards };
}
