/**
 * "My Decks" write/read paths. Per-user (owner authz), so every call uses
 * authMode 'userPool' — the owner rule scopes rows to the signed-in Cognito
 * user automatically. A wrong authMode here returns EMPTY, not an error
 * (stoop ADR 0004).
 */
import { dataClient, type UserDeckRecord } from '../../lib/dataClient';

const USER_POOL = { authMode: 'userPool' } as const;

export interface SaveDeckInput {
  deckId: string;
  topic: string;
  categorySlug?: string | null;
  cardCount?: number | null;
  coverImagePath?: string | null;
}

/**
 * The current user's saved decks, newest first and deduped by deckId. A user
 * can hold several UserDeck rows for the same deck (re-adds, races), so the
 * library shows each deck once — the newest row wins after the sort.
 */
export async function fetchMyDecks(): Promise<UserDeckRecord[]> {
  const { data } = await dataClient.models.UserDeck.list({ limit: 500, ...USER_POOL });
  const newestFirst = [...data].sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''));
  const seen = new Set<string>();
  return newestFirst.filter((d) => !seen.has(d.deckId) && seen.add(d.deckId));
}

/** The current user's saved row(s) for a deck (usually 0 or 1). */
async function listSaves(deckId: string): Promise<UserDeckRecord[]> {
  // A low limit Scans that many rows BEFORE filtering — list a full page.
  const { data } = await dataClient.models.UserDeck.list({
    filter: { deckId: { eq: deckId } },
    limit: 500,
    ...USER_POOL,
  });
  return data;
}

/** The current user's saved row for a deck, or null if not saved. */
export async function findMyDeck(deckId: string): Promise<UserDeckRecord | null> {
  return (await listSaves(deckId))[0] ?? null;
}

/** Add a deck to the current user's library (no-op if already saved). */
export async function addMyDeck(input: SaveDeckInput): Promise<void> {
  if (await findMyDeck(input.deckId)) return;
  const { errors } = await dataClient.models.UserDeck.create(
    {
      deckId: input.deckId,
      topic: input.topic,
      categorySlug: input.categorySlug ?? undefined,
      cardCount: input.cardCount ?? 0,
      coverImagePath: input.coverImagePath ?? undefined,
      addedAt: new Date().toISOString(),
    },
    USER_POOL,
  );
  if (errors) throw new Error(errors[0]?.message ?? 'Failed to add deck.');
}

/** Remove the deck from the current user's library (clears any duplicates). */
export async function removeMyDeck(deckId: string): Promise<void> {
  for (const row of await listSaves(deckId)) {
    const { errors } = await dataClient.models.UserDeck.delete({ id: row.id }, USER_POOL);
    if (errors) throw new Error(errors[0]?.message ?? 'Failed to remove deck.');
  }
}
