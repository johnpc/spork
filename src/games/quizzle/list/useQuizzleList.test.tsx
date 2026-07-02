import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchQuizzles: vi.fn() }));
vi.mock('../play/quizzleApi', () => api);

import { useQuizzleList } from './useQuizzleList';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useQuizzleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fetched quizzles', async () => {
    api.fetchQuizzles.mockResolvedValue([{ id: 'q1' }]);
    const { result } = renderHook(() => useQuizzleList(), { wrapper });
    await waitFor(() => expect(result.current.quizzles).toHaveLength(1));
  });

  it('defaults to empty before load', () => {
    api.fetchQuizzles.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useQuizzleList(), { wrapper });
    expect(result.current.quizzles).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
