import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ generateDeck: vi.fn(), fetchGenerationRuns: vi.fn() }));
vi.mock('./generateApi', () => api);

import { useGenerateDeck } from './useGenerateDeck';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useGenerateDeck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchGenerationRuns.mockResolvedValue([{ id: 'r1', topic: 'A', status: 'RUNNING' }]);
    api.generateDeck.mockResolvedValue({ runId: 'r1', deckId: 'd1' });
  });

  it('lists runs and starts a generation', async () => {
    const { result } = renderHook(() => useGenerateDeck(), { wrapper });
    await waitFor(() => expect(result.current.runs[0]?.id).toBe('r1'));
    await act(async () => {
      await result.current.generate({
        topic: 'A',
        categorySlug: 'x',
        cardCount: 5,
        voiceLanguage: 'en-US',
      });
    });
    expect(api.generateDeck).toHaveBeenCalled();
  });
});
