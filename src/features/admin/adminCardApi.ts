/**
 * Admin card writes (editors group, userPool authz). Keeps the owning deck's
 * cardCount in sync on add/delete so Discover/cards read it without a recount.
 */
import { dataClient } from '../../lib/dataClient';

const EDITOR = { authMode: 'userPool' } as const;

export interface CardInput {
  front: string;
  back: string;
  hint?: string;
  example?: string;
}

/** Recompute and persist a deck's cardCount from its current cards. */
async function syncCardCount(deckId: string): Promise<void> {
  const { data } = await dataClient.models.Card.listCardByDeckIdAndOrd(
    { deckId },
    { limit: 1000, ...EDITOR },
  );
  await dataClient.models.Deck.update({ id: deckId, cardCount: data.length }, EDITOR);
}

/** Append a card to a deck at the next ordinal. */
export async function addCard(deckId: string, ord: number, input: CardInput): Promise<void> {
  const { errors } = await dataClient.models.Card.create({ deckId, ord, ...input }, EDITOR);
  if (errors) throw new Error(errors[0]?.message ?? 'Failed to add card.');
  await syncCardCount(deckId);
}

/** Edit a card's text fields in place. */
export async function updateCard(cardId: string, input: CardInput): Promise<void> {
  const { errors } = await dataClient.models.Card.update({ id: cardId, ...input }, EDITOR);
  if (errors) throw new Error(errors[0]?.message ?? 'Failed to update card.');
}

/** Delete a card and resync the deck's count. */
export async function deleteCard(deckId: string, cardId: string): Promise<void> {
  const { errors } = await dataClient.models.Card.delete({ id: cardId }, EDITOR);
  if (errors) throw new Error(errors[0]?.message ?? 'Failed to delete card.');
  await syncCardCount(deckId);
}

/** Persist a new ordinal for a card (used by reorder). */
export async function setCardOrder(cardId: string, ord: number): Promise<void> {
  const { errors } = await dataClient.models.Card.update({ id: cardId, ord }, EDITOR);
  if (errors) throw new Error(errors[0]?.message ?? 'Failed to reorder card.');
}
