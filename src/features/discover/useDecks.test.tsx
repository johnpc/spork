import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchDecksByCategory: vi.fn() }));
vi.mock('./deckApi', () => api);

import { useDecks } from './useDecks';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useDecks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches decks for a category', async () => {
    api.fetchDecksByCategory.mockResolvedValue([{ id: 'd1', topic: 'A', cardCount: 5 }]);
    const { result } = renderHook(() => useDecks('languages'), { wrapper });
    await waitFor(() => expect(result.current.data?.[0].id).toBe('d1'));
    expect(api.fetchDecksByCategory).toHaveBeenCalledWith('languages');
  });

  it('is disabled without a category slug', () => {
    const { result } = renderHook(() => useDecks(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(api.fetchDecksByCategory).not.toHaveBeenCalled();
  });
});
