/**
 * Pure builder for the cross-deck "Due today" summary. Given each saved deck and
 * the count of cards due/new in it (computed by the queue builder), returns the
 * per-deck rows that have something to study plus the grand total — so the user
 * sees "23 cards across 4 decks" without opening each deck.
 */
export interface DeckDueInput {
  deckId: string;
  topic: string;
  dueCount: number;
}

export interface DueSummary {
  total: number;
  decks: Array<{ deckId: string; topic: string; dueCount: number }>;
}

/** Keep only decks with cards to study, ordered by most-due first. */
export function composeDueSummary(inputs: DeckDueInput[]): DueSummary {
  const decks = inputs
    .filter((d) => d.dueCount > 0)
    .sort((a, b) => b.dueCount - a.dueCount)
    .map((d) => ({ deckId: d.deckId, topic: d.topic, dueCount: d.dueCount }));
  const total = decks.reduce((sum, d) => sum + d.dueCount, 0);
  return { total, decks };
}
