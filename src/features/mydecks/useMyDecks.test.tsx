import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchMyDecks: vi.fn() }));
const auth = vi.hoisted(() => ({ status: 'authenticated' as string }));
vi.mock('./myDecksApi', () => api);
vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ status: auth.status }) }));

import { useMyDecks } from './useMyDecks';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useMyDecks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.status = 'authenticated';
  });

  it('returns the saved decks when authenticated', async () => {
    api.fetchMyDecks.mockResolvedValue([{ id: '1', deckId: 'd1', topic: 'A' }]);
    const { result } = renderHook(() => useMyDecks(), { wrapper });
    await waitFor(() => expect(result.current.decks[0]?.topic).toBe('A'));
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('is empty and idle when not authenticated', () => {
    auth.status = 'unauthenticated';
    const { result } = renderHook(() => useMyDecks(), { wrapper });
    expect(result.current.decks).toEqual([]);
    expect(result.current.isAuthenticated).toBe(false);
    expect(api.fetchMyDecks).not.toHaveBeenCalled();
  });
});
