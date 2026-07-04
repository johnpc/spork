import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchWordles: vi.fn() }));
vi.mock('../play/wordleApi', () => api);

import { useWordles } from './useWordles';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useWordles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fetched puzzles', async () => {
    api.fetchWordles.mockResolvedValue([
      {
        id: 'w1',
        answer: 'crane',
        wordLength: 5,
        maxGuesses: 6,
        status: 'PUBLISHED',
      },
    ]);
    const { result } = renderHook(() => useWordles(), { wrapper });
    await waitFor(() => expect(result.current.puzzles).toHaveLength(1));
    expect(result.current.puzzles[0].id).toBe('w1');
  });

  it('defaults to empty before load', () => {
    api.fetchWordles.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useWordles(), { wrapper });
    expect(result.current.puzzles).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('exposes refetch function', async () => {
    api.fetchWordles.mockResolvedValue([]);
    const { result } = renderHook(() => useWordles(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('handles error state', async () => {
    api.fetchWordles.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useWordles(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
