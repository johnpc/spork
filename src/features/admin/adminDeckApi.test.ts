import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn(), del: vi.fn() }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: {
    models: { Deck: { list: m.list, create: m.create, update: m.update, delete: m.del } },
  },
}));

import { fetchAllDecks, createDeck, setDeckPublished, deleteDeck } from './adminDeckApi';

const EDITOR = { authMode: 'userPool' };

describe('adminDeckApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.create.mockResolvedValue({ data: { id: 'new' }, errors: null });
    m.update.mockResolvedValue({ errors: null });
    m.del.mockResolvedValue({ errors: null });
  });

  it('fetchAllDecks lists with editor auth, newest first', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: '1', createdAt: '2026-01-01' },
        { id: '2', createdAt: '2026-03-01' },
      ],
    });
    const decks = await fetchAllDecks();
    expect(m.list).toHaveBeenCalledWith(expect.objectContaining(EDITOR));
    expect(decks.map((d) => d.id)).toEqual(['2', '1']);
  });

  it('createDeck creates a DRAFT and returns its id', async () => {
    const id = await createDeck({ topic: 'A', categorySlug: 'languages' });
    expect(id).toBe('new');
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'A', status: 'DRAFT', cardCount: 0 }),
      EDITOR,
    );
  });

  it('setDeckPublished stamps publishedAt when going live', async () => {
    await setDeckPublished('d1', true);
    expect(m.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'd1', status: 'PUBLISHED', publishedAt: expect.any(String) }),
      EDITOR,
    );
  });

  it('setDeckPublished clears to DRAFT when unpublishing', async () => {
    await setDeckPublished('d1', false);
    expect(m.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'd1', status: 'DRAFT', publishedAt: undefined }),
      EDITOR,
    );
  });

  it('createDeck throws on error', async () => {
    m.create.mockResolvedValue({ data: null, errors: [{ message: 'denied' }] });
    await expect(createDeck({ topic: 'A', categorySlug: 'x' })).rejects.toThrow('denied');
  });

  it('deleteDeck throws on error', async () => {
    m.del.mockResolvedValue({ errors: [{ message: 'nope' }] });
    await expect(deleteDeck('d1')).rejects.toThrow('nope');
  });
});
