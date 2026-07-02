/**
 * Admin deck writes. Decks are written by the 'editors' Cognito group, which is
 * userPool-based — so every call uses authMode 'userPool' (stoop ADR 0004/0005).
 */
import { dataClient, type DeckRecord } from '../../lib/dataClient';

const EDITOR = { authMode: 'userPool' } as const;

export interface NewDeck {
  topic: string;
  categorySlug: string;
  description?: string;
  voiceLanguage?: string;
}

/** All decks (any status) for the admin manage list, newest first. */
export async function fetchAllDecks(): Promise<DeckRecord[]> {
  const { data } = await dataClient.models.Deck.list({ limit: 500, ...EDITOR });
  return [...data].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

/** Create a DRAFT deck. Returns the new deck id. */
export async function createDeck(input: NewDeck): Promise<string> {
  const { data, errors } = await dataClient.models.Deck.create(
    { ...input, status: 'DRAFT', cardCount: 0 },
    EDITOR,
  );
  if (errors || !data) throw new Error(errors?.[0]?.message ?? 'Failed to create deck.');
  return data.id;
}

/** Flip a deck's published state, stamping publishedAt when going live. */
export async function setDeckPublished(deckId: string, published: boolean): Promise<void> {
  const { errors } = await dataClient.models.Deck.update(
    {
      id: deckId,
      status: published ? 'PUBLISHED' : 'DRAFT',
      publishedAt: published ? new Date().toISOString() : undefined,
    },
    EDITOR,
  );
  if (errors) throw new Error(errors[0]?.message ?? 'Failed to update deck.');
}

/** Delete a deck (its cards are removed separately by the caller). */
export async function deleteDeck(deckId: string): Promise<void> {
  const { errors } = await dataClient.models.Deck.delete({ id: deckId }, EDITOR);
  if (errors) throw new Error(errors[0]?.message ?? 'Failed to delete deck.');
}
