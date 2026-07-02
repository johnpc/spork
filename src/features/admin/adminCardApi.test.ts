import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({
  listCards: vi.fn(),
  cardCreate: vi.fn(),
  cardUpdate: vi.fn(),
  cardDelete: vi.fn(),
  deckUpdate: vi.fn(),
}));
vi.mock('../../lib/dataClient', () => ({
  dataClient: {
    models: {
      Card: {
        listCardByDeckIdAndOrd: m.listCards,
        create: m.cardCreate,
        update: m.cardUpdate,
        delete: m.cardDelete,
      },
      Deck: { update: m.deckUpdate },
    },
  },
}));

import { addCard, updateCard, deleteCard, setCardOrder } from './adminCardApi';

const EDITOR = { authMode: 'userPool' };

describe('adminCardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.cardCreate.mockResolvedValue({ errors: null });
    m.cardUpdate.mockResolvedValue({ errors: null });
    m.cardDelete.mockResolvedValue({ errors: null });
    m.deckUpdate.mockResolvedValue({ errors: null });
    m.listCards.mockResolvedValue({ data: [{ id: 'c1' }, { id: 'c2' }] });
  });

  it('addCard creates the card then syncs the deck cardCount', async () => {
    await addCard('d1', 2, { front: 'F', back: 'B' });
    expect(m.cardCreate).toHaveBeenCalledWith(
      { deckId: 'd1', ord: 2, front: 'F', back: 'B' },
      EDITOR,
    );
    expect(m.deckUpdate).toHaveBeenCalledWith({ id: 'd1', cardCount: 2 }, EDITOR);
  });

  it('updateCard edits text fields in place', async () => {
    await updateCard('c1', { front: 'F2', back: 'B2' });
    expect(m.cardUpdate).toHaveBeenCalledWith({ id: 'c1', front: 'F2', back: 'B2' }, EDITOR);
  });

  it('deleteCard removes the card then resyncs cardCount', async () => {
    await deleteCard('d1', 'c1');
    expect(m.cardDelete).toHaveBeenCalledWith({ id: 'c1' }, EDITOR);
    expect(m.deckUpdate).toHaveBeenCalledWith({ id: 'd1', cardCount: 2 }, EDITOR);
  });

  it('setCardOrder persists a new ordinal', async () => {
    await setCardOrder('c1', 5);
    expect(m.cardUpdate).toHaveBeenCalledWith({ id: 'c1', ord: 5 }, EDITOR);
  });

  it('addCard throws when create errors', async () => {
    m.cardCreate.mockResolvedValue({ errors: [{ message: 'denied' }] });
    await expect(addCard('d1', 0, { front: 'F', back: 'B' })).rejects.toThrow('denied');
  });
});
