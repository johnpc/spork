/** Deck-detail read: one deck + its cards (ordered). Guest-readable. */
import {
  dataClient,
  readAuthMode,
  unwrap,
  type DeckRecord,
  type CardRecord,
} from '../../lib/dataClient';

export interface DeckDetail {
  deck: DeckRecord;
  cards: CardRecord[];
}

export async function fetchDeckDetail(deckId: string): Promise<DeckDetail | null> {
  const authMode = await readAuthMode();
  // unwrap so a failed read throws (→ retry) instead of a false "Deck not found".
  const deck = unwrap(await dataClient.models.Deck.get({ id: deckId }, { authMode }));
  if (!deck) return null;
  // Query cards by the deckId(ord) GSI — ordered, single-partition (no Scan).
  const cards = unwrap(
    await dataClient.models.Card.listCardByDeckIdAndOrd({ deckId }, { limit: 500, authMode }),
  );
  return { deck, cards };
}
