import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ get: vi.fn(), listCards: vi.fn() }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: { models: { Deck: { get: m.get }, Card: { listCardByDeckIdAndOrd: m.listCards } } },
  readAuthMode: () => Promise.resolve('identityPool'),
}));

import { fetchDeckDetail } from './deckDetailApi';

describe('fetchDeckDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when the deck is missing', async () => {
    m.get.mockResolvedValue({ data: null });
    expect(await fetchDeckDetail('nope')).toBeNull();
    expect(m.listCards).not.toHaveBeenCalled();
  });

  it('returns the deck and its cards via the deckId GSI', async () => {
    m.get.mockResolvedValue({ data: { id: 'd1', topic: 'Spanish' } });
    m.listCards.mockResolvedValue({ data: [{ id: 'c1', ord: 0, front: 'Hola', back: 'Hi' }] });
    const detail = await fetchDeckDetail('d1');
    expect(detail?.deck.topic).toBe('Spanish');
    expect(detail?.cards[0].front).toBe('Hola');
    expect(m.listCards).toHaveBeenCalledWith(
      { deckId: 'd1' },
      expect.objectContaining({ authMode: 'identityPool' }),
    );
  });
});
