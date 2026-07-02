import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchAcrostic: vi.fn() }));
vi.mock('./acrosticApi', () => api);

import { useAcrostic } from './useAcrostic';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const acrostic = {
  id: 'a1',
  title: 'On Trying',
  quote: 'Do or do not',
  author: 'Yoda',
  clues: JSON.stringify([
    { clue: 'A feline', answer: 'cat' },
    { clue: 'Frozen water', answer: 'ice' },
  ]),
};

describe('useAcrostic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchAcrostic.mockResolvedValue(acrostic);
  });

  it('loads clues with the quote fully masked', async () => {
    const { result } = renderHook(() => useAcrostic('a1'), { wrapper });
    await waitFor(() => expect(result.current.total).toBe(2));
    expect(result.current.solvedCount).toBe(0);
    expect(result.current.complete).toBe(false);
    expect(result.current.revealed).toEqual(['__', '__', '__', '___']);
  });

  it('solves clues, reveals the quote, and completes', async () => {
    const { result } = renderHook(() => useAcrostic('a1'), { wrapper });
    await waitFor(() => expect(result.current.total).toBe(2));
    act(() => void result.current.guess(0, 'CAT'));
    expect(result.current.revealed).toEqual(['Do', 'or', '__', '___']);
    act(() => void result.current.guess(1, ' ice '));
    expect(result.current.complete).toBe(true);
    expect(result.current.revealed).toEqual(['Do', 'or', 'do', 'not']);
    expect(result.current.author).toBe('Yoda');
  });

  it('stays idle with no id (nothing to load)', () => {
    const { result } = renderHook(() => useAcrostic(undefined), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.acrostic).toBeNull();
    expect(result.current.total).toBe(0);
  });

  it('flags a wrong guess and does not solve it', async () => {
    const { result } = renderHook(() => useAcrostic('a1'), { wrapper });
    await waitFor(() => expect(result.current.total).toBe(2));
    let ok = true;
    act(() => {
      ok = result.current.guess(0, 'dog');
    });
    expect(ok).toBe(false);
    expect(result.current.lastWrong).toBe(0);
    expect(result.current.solvedCount).toBe(0);
  });

  it('ignores a re-guess of an already-solved clue and resets', async () => {
    const { result } = renderHook(() => useAcrostic('a1'), { wrapper });
    await waitFor(() => expect(result.current.total).toBe(2));
    act(() => void result.current.guess(0, 'cat'));
    let ok = true;
    act(() => {
      ok = result.current.guess(0, 'cat');
    });
    expect(ok).toBe(false);
    act(() => result.current.reset());
    expect(result.current.solvedCount).toBe(0);
    expect(result.current.lastWrong).toBeNull();
  });
});
