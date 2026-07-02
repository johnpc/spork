import { describe, it, expect } from 'vitest';
import { composeDecks } from './composeDecks';
import type { DeckRecord } from '../../lib/dataClient';

const deck = (over: Partial<DeckRecord>): DeckRecord =>
  ({
    id: 'd1',
    topic: 'Spanish Phrases',
    categorySlug: 'languages',
    description: null,
    status: 'PUBLISHED',
    cardCount: 10,
    coverImagePath: null,
    publishedAt: '2026-01-01T00:00:00Z',
    ...over,
  }) as DeckRecord;

describe('composeDecks', () => {
  it('keeps only PUBLISHED decks', () => {
    const out = composeDecks([
      deck({ id: 'pub', status: 'PUBLISHED' }),
      deck({ id: 'draft', status: 'DRAFT' }),
      deck({ id: 'arch', status: 'ARCHIVED' }),
    ]);
    expect(out.map((d) => d.id)).toEqual(['pub']);
  });

  it('orders published decks newest publishedAt first', () => {
    const out = composeDecks([
      deck({ id: 'old', publishedAt: '2026-01-01T00:00:00Z' }),
      deck({ id: 'new', publishedAt: '2026-03-01T00:00:00Z' }),
    ]);
    expect(out.map((d) => d.id)).toEqual(['new', 'old']);
  });

  it('sorts decks with no publishedAt last', () => {
    const out = composeDecks([
      deck({ id: 'undated', publishedAt: null }),
      deck({ id: 'dated', publishedAt: '2026-02-01T00:00:00Z' }),
    ]);
    expect(out.map((d) => d.id)).toEqual(['dated', 'undated']);
  });

  it('drops null rows and defaults a missing cardCount to 0', () => {
    const out = composeDecks([null, deck({ id: 'x', cardCount: null as unknown as number })]);
    expect(out).toHaveLength(1);
    expect(out[0].cardCount).toBe(0);
  });

  it('projects the card fields the grid needs', () => {
    const [card] = composeDecks([deck({ topic: 'Greek Gods', description: 'Olympians' })]);
    expect(card).toMatchObject({ topic: 'Greek Gods', description: 'Olympians' });
  });
});
