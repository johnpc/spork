import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchStat: vi.fn(), flushPending: vi.fn() }));
const auth = vi.hoisted(() => ({ status: 'authenticated' as string, email: 'me@x.com' }));
vi.mock('./statApi', () => api);
vi.mock('../auth/useAuth', () => ({ useAuth: () => auth }));

import { useStat } from './useStat';
import { addPending } from './pendingSessions';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const pending = { sessionId: 'p1', owner: 'me@x.com', day: '2026-06-10', reviewed: 3 };

describe('useStat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    auth.status = 'authenticated';
    api.flushPending.mockResolvedValue(undefined);
  });

  it('returns the stat when authenticated', async () => {
    api.fetchStat.mockResolvedValue({ currentStreak: 4 });
    const { result } = renderHook(() => useStat(), { wrapper });
    await waitFor(() => expect(result.current.stat?.currentStreak).toBe(4));
    expect(api.flushPending).not.toHaveBeenCalled(); // nothing queued
  });

  it('shows a queued session the server has not confirmed yet', async () => {
    addPending(pending);
    api.flushPending.mockRejectedValue(new Error('offline'));
    api.fetchStat.mockResolvedValue(null);
    const { result } = renderHook(() => useStat(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(api.flushPending).toHaveBeenCalledWith('me@x.com');
    expect(result.current.stat?.currentStreak).toBe(1);
  });

  it('is null + idle when signed out', () => {
    auth.status = 'unauthenticated';
    const { result } = renderHook(() => useStat(), { wrapper });
    expect(result.current.stat).toBeNull();
    expect(api.fetchStat).not.toHaveBeenCalled();
  });
});
