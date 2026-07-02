import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchPuzzles: vi.fn() }));
vi.mock('../play/chessApi', () => api);

import { useChessPuzzles } from './useChessPuzzles';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useChessPuzzles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fetched puzzles', async () => {
    api.fetchPuzzles.mockResolvedValue([{ id: 'p1' }]);
    const { result } = renderHook(() => useChessPuzzles(), { wrapper });
    await waitFor(() => expect(result.current.puzzles).toHaveLength(1));
  });

  it('defaults to empty before load', () => {
    api.fetchPuzzles.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useChessPuzzles(), { wrapper });
    expect(result.current.puzzles).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
