import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ byCategory: vi.fn() }));
const auth = vi.hoisted(() => ({ mode: 'identityPool' as string }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: { models: { Deck: { listDeckByCategorySlug: m.byCategory } } },
  readAuthMode: () => Promise.resolve(auth.mode),
}));

import { fetchDecksByCategory } from './deckApi';

describe('fetchDecksByCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mode = 'identityPool';
    m.byCategory.mockResolvedValue({
      data: [
        { id: 'a', topic: 'A', status: 'PUBLISHED', cardCount: 5, publishedAt: '2026-02-01' },
        { id: 'b', topic: 'B', status: 'DRAFT', cardCount: 3, publishedAt: '2026-03-01' },
      ],
    });
  });

  it('queries the categorySlug GSI and returns only published decks', async () => {
    const decks = await fetchDecksByCategory('languages');
    expect(m.byCategory).toHaveBeenCalledWith(
      { categorySlug: 'languages' },
      expect.objectContaining({ authMode: 'identityPool' }),
    );
    expect(decks.map((d) => d.id)).toEqual(['a']);
  });
});
