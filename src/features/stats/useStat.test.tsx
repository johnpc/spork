import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchStat: vi.fn() }));
const auth = vi.hoisted(() => ({ status: 'authenticated' as string }));
vi.mock('./statApi', () => ({ fetchStat: api.fetchStat }));
vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ status: auth.status }) }));

import { useStat } from './useStat';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useStat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.status = 'authenticated';
  });

  it('returns the stat when authenticated', async () => {
    api.fetchStat.mockResolvedValue({ currentStreak: 4 });
    const { result } = renderHook(() => useStat(), { wrapper });
    await waitFor(() => expect(result.current.stat?.currentStreak).toBe(4));
  });

  it('is null + idle when signed out', () => {
    auth.status = 'unauthenticated';
    const { result } = renderHook(() => useStat(), { wrapper });
    expect(result.current.stat).toBeNull();
    expect(api.fetchStat).not.toHaveBeenCalled();
  });
});
