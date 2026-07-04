import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchBees: vi.fn() }));
vi.mock('../play/beeApi', () => api);

import { useBees } from './useBees';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useBees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fetched puzzles', async () => {
    api.fetchBees.mockResolvedValue([{ id: 'b1' }]);
    const { result } = renderHook(() => useBees(), { wrapper });
    await waitFor(() => expect(result.current.bees).toHaveLength(1));
  });

  it('defaults to empty before load', () => {
    api.fetchBees.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useBees(), { wrapper });
    expect(result.current.bees).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
