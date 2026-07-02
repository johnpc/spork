import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const detail = vi.hoisted(() => ({ fetchDeckDetail: vi.fn() }));
const cardApi = vi.hoisted(() => ({
  addCard: vi.fn(),
  updateCard: vi.fn(),
  deleteCard: vi.fn(),
  setCardOrder: vi.fn(),
}));
vi.mock('../deck/deckDetailApi', () => detail);
vi.mock('./adminCardApi', () => cardApi);
vi.mock('./generateApi', () => ({ regenerateCardMedia: vi.fn().mockResolvedValue('path') }));

import { useAdminCards } from './useAdminCards';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const deckData = {
  deck: { id: 'd1', topic: 'A' },
  cards: [
    { id: 'c1', deckId: 'd1', ord: 0, front: 'a', back: 'A' },
    { id: 'c2', deckId: 'd1', ord: 1, front: 'b', back: 'B' },
  ],
};

describe('useAdminCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    detail.fetchDeckDetail.mockResolvedValue(deckData);
    Object.values(cardApi).forEach((fn) => fn.mockResolvedValue(undefined));
  });

  it('adds a card at the next ordinal (max+1)', async () => {
    const { result } = renderHook(() => useAdminCards('d1'), { wrapper });
    await waitFor(() => expect(result.current.cards).toHaveLength(2));
    await act(async () => {
      await result.current.add({ front: 'c', back: 'C' });
    });
    expect(cardApi.addCard).toHaveBeenCalledWith('d1', 2, { front: 'c', back: 'C' });
  });

  it('reorders via the pure helper, persisting the swapped ordinals', async () => {
    const { result } = renderHook(() => useAdminCards('d1'), { wrapper });
    await waitFor(() => expect(result.current.cards).toHaveLength(2));
    await act(async () => result.current.move({ id: 'c2', direction: 'up' }));
    await waitFor(() => expect(cardApi.setCardOrder).toHaveBeenCalledTimes(2));
    expect(cardApi.setCardOrder).toHaveBeenCalledWith('c2', 0);
    expect(cardApi.setCardOrder).toHaveBeenCalledWith('c1', 1);
  });

  it('edits and deletes a card', async () => {
    const { result } = renderHook(() => useAdminCards('d1'), { wrapper });
    await waitFor(() => expect(result.current.cards).toHaveLength(2));
    await act(async () => {
      result.current.edit({ id: 'c1', input: { front: 'x', back: 'y' } });
      result.current.remove('c2');
    });
    await waitFor(() =>
      expect(cardApi.updateCard).toHaveBeenCalledWith('c1', { front: 'x', back: 'y' }),
    );
    expect(cardApi.deleteCard).toHaveBeenCalledWith('d1', 'c2');
  });
});
