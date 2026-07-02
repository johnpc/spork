import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), del: vi.fn() }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: { models: { UserDeck: { list: m.list, create: m.create, delete: m.del } } },
}));

import { fetchMyDecks, findMyDeck, addMyDeck, removeMyDeck } from './myDecksApi';

const USER_POOL = { authMode: 'userPool' };

describe('myDecksApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.create.mockResolvedValue({ errors: null });
    m.del.mockResolvedValue({ errors: null });
  });

  it('fetchMyDecks lists with userPool auth, newest first', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: '1', deckId: 'd1', topic: 'Old', addedAt: '2026-01-01' },
        { id: '2', deckId: 'd2', topic: 'New', addedAt: '2026-03-01' },
      ],
    });
    const decks = await fetchMyDecks();
    expect(m.list).toHaveBeenCalledWith(expect.objectContaining(USER_POOL));
    expect(decks.map((d) => d.topic)).toEqual(['New', 'Old']);
  });

  it('dedupes multiple rows for the same deck, keeping the newest', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: '1', deckId: 'd1', topic: 'Spanish (old)', addedAt: '2026-01-01' },
        { id: '2', deckId: 'd1', topic: 'Spanish (new)', addedAt: '2026-03-01' },
      ],
    });
    const decks = await fetchMyDecks();
    expect(decks).toHaveLength(1);
    expect(decks[0].topic).toBe('Spanish (new)');
  });

  it('findMyDeck filters by deckId and returns the first match', async () => {
    m.list.mockResolvedValue({ data: [{ id: 'x', deckId: 'd1' }] });
    const row = await findMyDeck('d1');
    expect(m.list).toHaveBeenCalledWith(
      expect.objectContaining({ filter: { deckId: { eq: 'd1' } }, authMode: 'userPool' }),
    );
    expect(row?.id).toBe('x');
  });

  it('addMyDeck is a no-op when the deck is already saved', async () => {
    m.list.mockResolvedValue({ data: [{ id: 'x', deckId: 'd1' }] });
    await addMyDeck({ deckId: 'd1', topic: 'A' });
    expect(m.create).not.toHaveBeenCalled();
  });

  it('addMyDeck creates a row with userPool auth when not saved', async () => {
    m.list.mockResolvedValue({ data: [] });
    await addMyDeck({ deckId: 'd1', topic: 'A', cardCount: 5 });
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({ deckId: 'd1', topic: 'A', cardCount: 5 }),
      USER_POOL,
    );
  });

  it('addMyDeck throws when create errors', async () => {
    m.list.mockResolvedValue({ data: [] });
    m.create.mockResolvedValue({ errors: [{ message: 'denied' }] });
    await expect(addMyDeck({ deckId: 'd1', topic: 'A' })).rejects.toThrow('denied');
  });

  it('removeMyDeck deletes every matching row', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', deckId: 'd1' },
        { id: 'b', deckId: 'd1' },
      ],
    });
    await removeMyDeck('d1');
    expect(m.del).toHaveBeenCalledTimes(2);
    expect(m.del).toHaveBeenCalledWith({ id: 'a' }, USER_POOL);
  });

  it('removeMyDeck throws when a delete errors', async () => {
    m.list.mockResolvedValue({ data: [{ id: 'a', deckId: 'd1' }] });
    m.del.mockResolvedValue({ errors: [{ message: 'nope' }] });
    await expect(removeMyDeck('d1')).rejects.toThrow('nope');
  });
});
