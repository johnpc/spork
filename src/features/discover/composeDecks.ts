/**
 * Pure shaping for a category's deck grid: keep only PUBLISHED decks and order
 * them newest-first. Kept separate from I/O so it's fully unit-testable.
 */
import type { DeckRecord } from '../../lib/dataClient';

export interface DeckCardData {
  id: string;
  topic: string;
  description?: string | null;
  cardCount: number;
  coverImagePath?: string | null;
}

/** Published decks only, newest publishedAt first (undated decks sort last). */
export function composeDecks(decks: Array<DeckRecord | null>): DeckCardData[] {
  return decks
    .filter((d): d is DeckRecord => d !== null && d.status === 'PUBLISHED')
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
    .map((d) => ({
      id: d.id,
      topic: d.topic,
      description: d.description,
      cardCount: d.cardCount ?? 0,
      coverImagePath: d.coverImagePath,
    }));
}
