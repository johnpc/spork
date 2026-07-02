import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ deckCreate: vi.fn(), cardCreate: vi.fn() }));
vi.mock('./seedClient', () => ({
  client: { models: { Deck: { create: m.deckCreate }, Card: { create: m.cardCreate } } },
  EDITOR_WRITE: { authMode: 'userPool' },
}));

import { seedDeckData } from './seedDecks';

describe('seedDeckData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.deckCreate.mockResolvedValue({ data: { id: 'deck1' }, errors: null });
    m.cardCreate.mockResolvedValue({ errors: null });
  });

  it('creates each demo deck as PUBLISHED with its card count', async () => {
    const count = await seedDeckData();
    expect(count).toBe(2);
    expect(m.deckCreate).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'Top Spanish Phrases', status: 'PUBLISHED', cardCount: 3 }),
      { authMode: 'userPool' },
    );
  });

  it('creates a Card per fixture card with its deckId', async () => {
    await seedDeckData();
    // 3 Spanish + 2 Greek = 5 cards total.
    expect(m.cardCreate).toHaveBeenCalledTimes(5);
    expect(m.cardCreate).toHaveBeenCalledWith(
      expect.objectContaining({ deckId: 'deck1', ord: 0, front: 'Hola' }),
      { authMode: 'userPool' },
    );
  });

  it('throws when a deck create returns errors', async () => {
    m.deckCreate.mockResolvedValueOnce({ data: null, errors: [{ message: 'denied' }] });
    await expect(seedDeckData()).rejects.toThrow(/Deck/);
  });

  it('throws when a card create returns errors', async () => {
    m.cardCreate.mockResolvedValueOnce({ errors: [{ message: 'bad' }] });
    await expect(seedDeckData()).rejects.toThrow(/Card/);
  });
});
