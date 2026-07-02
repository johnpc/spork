import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchDeckDetail: vi.fn() }));
vi.mock('./deckDetailApi', () => api);

import { useDeckDetail } from './useDeckDetail';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useDeckDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the deck detail by id', async () => {
    api.fetchDeckDetail.mockResolvedValue({ deck: { id: 'd1', topic: 'A' }, cards: [] });
    const { result } = renderHook(() => useDeckDetail('d1'), { wrapper });
    await waitFor(() => expect(result.current.data?.deck.topic).toBe('A'));
  });

  it('is disabled without a deck id', () => {
    const { result } = renderHook(() => useDeckDetail(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(api.fetchDeckDetail).not.toHaveBeenCalled();
  });
});
