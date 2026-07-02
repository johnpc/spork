import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchDueSummary: vi.fn() }));
const auth = vi.hoisted(() => ({ status: 'authenticated' as string }));
vi.mock('./dueSummaryApi', () => api);
vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ status: auth.status }) }));

import { useDueSummary } from './useDueSummary';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useDueSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.status = 'authenticated';
  });

  it('returns the summary when authenticated', async () => {
    api.fetchDueSummary.mockResolvedValue({
      total: 3,
      decks: [{ deckId: 'd1', topic: 'A', dueCount: 3 }],
    });
    const { result } = renderHook(() => useDueSummary(), { wrapper });
    await waitFor(() => expect(result.current.summary?.total).toBe(3));
  });

  it('is idle + null when signed out', () => {
    auth.status = 'unauthenticated';
    const { result } = renderHook(() => useDueSummary(), { wrapper });
    expect(result.current.summary).toBeNull();
    expect(api.fetchDueSummary).not.toHaveBeenCalled();
  });
});
