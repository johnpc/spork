import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ findMyDeck: vi.fn(), addMyDeck: vi.fn(), removeMyDeck: vi.fn() }));
const auth = vi.hoisted(() => ({ status: 'authenticated' as string }));
const push = vi.hoisted(() => vi.fn());
vi.mock('./myDecksApi', () => api);
vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ status: auth.status }) }));
vi.mock('react-router-dom', () => ({ useHistory: () => ({ push }) }));

import { useDeckSave } from './useDeckSave';

const input = { deckId: 'd1', topic: 'A' };

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useDeckSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.status = 'authenticated';
    api.findMyDeck.mockResolvedValue(null);
    api.addMyDeck.mockResolvedValue(undefined);
    api.removeMyDeck.mockResolvedValue(undefined);
  });

  it('adds the deck when not yet saved', async () => {
    const { result } = renderHook(() => useDeckSave(input), { wrapper });
    await waitFor(() => expect(result.current.busy).toBe(false));
    await act(async () => result.current.toggle());
    await waitFor(() => expect(api.addMyDeck).toHaveBeenCalledWith(input));
  });

  it('removes the deck when already saved', async () => {
    api.findMyDeck.mockResolvedValue({ id: 'x', deckId: 'd1' });
    const { result } = renderHook(() => useDeckSave(input), { wrapper });
    await waitFor(() => expect(result.current.isSaved).toBe(true));
    await act(async () => result.current.toggle());
    await waitFor(() => expect(api.removeMyDeck).toHaveBeenCalledWith('d1'));
  });

  it('redirects to sign-in instead of saving when signed out', async () => {
    auth.status = 'unauthenticated';
    const { result } = renderHook(() => useDeckSave(input), { wrapper });
    await act(async () => result.current.toggle());
    expect(push).toHaveBeenCalledWith('/signin');
    expect(api.addMyDeck).not.toHaveBeenCalled();
  });
});
