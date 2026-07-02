import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchLadders: vi.fn() }));
vi.mock('../play/ladderApi', () => api);

import { useLadders } from './useLadders';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useLadders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fetched ladders', async () => {
    api.fetchLadders.mockResolvedValue([{ id: 'l1' }]);
    const { result } = renderHook(() => useLadders(), { wrapper });
    await waitFor(() => expect(result.current.ladders).toHaveLength(1));
  });

  it('defaults to empty before load', () => {
    api.fetchLadders.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useLadders(), { wrapper });
    expect(result.current.ladders).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
