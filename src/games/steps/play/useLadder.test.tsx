import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchLadder: vi.fn() }));
vi.mock('./ladderApi', () => api);

import { useLadder } from './useLadder';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const ladder = {
  id: 'l1',
  start: 'cat',
  target: 'dog',
  dictionary: JSON.stringify(['cat', 'cot', 'cog', 'dog']),
  parPath: JSON.stringify(['cat', 'cot', 'cog', 'dog']),
};

describe('useLadder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchLadder.mockResolvedValue(ladder);
  });

  it('starts at the start word with par computed', async () => {
    const { result } = renderHook(() => useLadder('l1'), { wrapper });
    await waitFor(() => expect(result.current.start).toBe('cat'));
    expect(result.current.path).toEqual(['cat']);
    expect(result.current.par).toBe(3);
    expect(result.current.solved).toBe(false);
  });

  it('walks a valid ladder to solved', async () => {
    const { result } = renderHook(() => useLadder('l1'), { wrapper });
    await waitFor(() => expect(result.current.start).toBe('cat'));
    act(() => void result.current.submit('cot'));
    act(() => void result.current.submit('cog'));
    act(() => void result.current.submit('dog'));
    expect(result.current.path).toEqual(['cat', 'cot', 'cog', 'dog']);
    expect(result.current.solved).toBe(true);
    expect(result.current.moves).toBe(3);
  });

  it('rejects an invalid step and exposes the reason', async () => {
    const { result } = renderHook(() => useLadder('l1'), { wrapper });
    await waitFor(() => expect(result.current.start).toBe('cat'));
    let ok = true;
    act(() => {
      ok = result.current.submit('dog'); // two letters from cat
    });
    expect(ok).toBe(false);
    expect(result.current.lastError).toBe('not-one-letter');
    expect(result.current.path).toEqual(['cat']);
  });

  it('undo removes the last step', async () => {
    const { result } = renderHook(() => useLadder('l1'), { wrapper });
    await waitFor(() => expect(result.current.start).toBe('cat'));
    act(() => void result.current.submit('cot'));
    act(() => result.current.undo());
    expect(result.current.path).toEqual(['cat']);
  });

  it('giveUp sets gaveUp and blocks further input', async () => {
    const { result } = renderHook(() => useLadder('l1'), { wrapper });
    await waitFor(() => expect(result.current.start).toBe('cat'));
    expect(result.current.gaveUp).toBe(false);
    act(() => result.current.giveUp());
    expect(result.current.gaveUp).toBe(true);
    const ok = result.current.submit('cot');
    expect(ok).toBe(false);
    expect(result.current.path).toEqual(['cat']);
  });

  it('exposes the parPath for solution display', async () => {
    const { result } = renderHook(() => useLadder('l1'), { wrapper });
    await waitFor(() => expect(result.current.parPath).toEqual(['cat', 'cot', 'cog', 'dog']));
  });
});
