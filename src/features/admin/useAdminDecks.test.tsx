import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({
  fetchAllDecks: vi.fn(),
  createDeck: vi.fn(),
  setDeckPublished: vi.fn(),
  deleteDeck: vi.fn(),
}));
vi.mock('./adminDeckApi', () => api);

import { useAdminDecks } from './useAdminDecks';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useAdminDecks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchAllDecks.mockResolvedValue([{ id: 'd1', topic: 'A', status: 'DRAFT' }]);
    api.createDeck.mockResolvedValue('new');
    api.setDeckPublished.mockResolvedValue(undefined);
    api.deleteDeck.mockResolvedValue(undefined);
  });

  it('lists decks and exposes mutations', async () => {
    const { result } = renderHook(() => useAdminDecks(), { wrapper });
    await waitFor(() => expect(result.current.decks[0]?.id).toBe('d1'));
    await act(async () => {
      result.current.setPublished({ id: 'd1', published: true });
      result.current.remove('d1');
    });
    await waitFor(() => expect(api.setDeckPublished).toHaveBeenCalledWith('d1', true));
    expect(api.deleteDeck).toHaveBeenCalledWith('d1');
  });
});
