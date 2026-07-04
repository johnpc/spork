import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchConnections: vi.fn() }));
vi.mock('./connectionsApi', () => api);

import { useConnections } from './useConnections';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const puzzle = {
  id: 'c1',
  groups: JSON.stringify([
    { theme: 'Fruits', words: ['apple', 'banana', 'cherry', 'date'], level: 0 },
    { theme: 'Colors', words: ['red', 'blue', 'green', 'yellow'], level: 1 },
    { theme: 'Metals', words: ['iron', 'copper', 'gold', 'silver'], level: 2 },
    { theme: 'Planets', words: ['mars', 'venus', 'jupiter', 'saturn'], level: 3 },
  ]),
  maxMistakes: 4,
};

describe('useConnections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchConnections.mockResolvedValue(puzzle);
  });

  it('loads the puzzle and shuffles tiles deterministically', async () => {
    const { result } = renderHook(() => useConnections('c1'), { wrapper });
    await waitFor(() => expect(result.current.groups).toHaveLength(4));
    expect(result.current.tiles).toHaveLength(16);
    expect(result.current.selected).toEqual([]);
    expect(result.current.mistakes).toBe(0);
    expect(result.current.won).toBe(false);
    expect(result.current.lost).toBe(false);
  });

  it('toggles selection on/off', async () => {
    const { result } = renderHook(() => useConnections('c1'), { wrapper });
    await waitFor(() => expect(result.current.groups).toHaveLength(4));
    act(() => result.current.toggle('apple'));
    expect(result.current.selected).toEqual(['apple']);
    act(() => result.current.toggle('banana'));
    expect(result.current.selected).toEqual(['apple', 'banana']);
    act(() => result.current.toggle('apple')); // deselect
    expect(result.current.selected).toEqual(['banana']);
  });

  it('caps selection at 4 words', async () => {
    const { result } = renderHook(() => useConnections('c1'), { wrapper });
    await waitFor(() => expect(result.current.groups).toHaveLength(4));
    act(() => result.current.toggle('apple'));
    act(() => result.current.toggle('banana'));
    act(() => result.current.toggle('cherry'));
    act(() => result.current.toggle('date'));
    act(() => result.current.toggle('red')); // 5th attempt, ignored
    expect(result.current.selected).toHaveLength(4);
    expect(result.current.selected).not.toContain('red');
  });

  it('solves a correct group and clears selection', async () => {
    const { result } = renderHook(() => useConnections('c1'), { wrapper });
    await waitFor(() => expect(result.current.groups).toHaveLength(4));
    act(() => result.current.toggle('apple'));
    act(() => result.current.toggle('banana'));
    act(() => result.current.toggle('cherry'));
    act(() => result.current.toggle('date'));
    act(() => result.current.submit());
    expect(result.current.solvedGroups).toHaveLength(1);
    expect(result.current.solvedGroups[0].theme).toBe('Fruits');
    expect(result.current.selected).toEqual([]);
    expect(result.current.mistakes).toBe(0);
    expect(result.current.lastOneAway).toBe(false);
  });

  it('increments mistakes on wrong submission', async () => {
    const { result } = renderHook(() => useConnections('c1'), { wrapper });
    await waitFor(() => expect(result.current.groups).toHaveLength(4));
    act(() => result.current.toggle('apple'));
    act(() => result.current.toggle('red'));
    act(() => result.current.toggle('iron'));
    act(() => result.current.toggle('mars'));
    act(() => result.current.submit());
    expect(result.current.mistakes).toBe(1);
    expect(result.current.solvedGroups).toHaveLength(0);
  });

  it('shows one-away hint when 3 of 4 belong to a group', async () => {
    const { result } = renderHook(() => useConnections('c1'), { wrapper });
    await waitFor(() => expect(result.current.groups).toHaveLength(4));
    act(() => result.current.toggle('apple'));
    act(() => result.current.toggle('banana'));
    act(() => result.current.toggle('cherry'));
    act(() => result.current.toggle('red')); // wrong, but 3 fruits
    act(() => result.current.submit());
    expect(result.current.lastOneAway).toBe(true);
    expect(result.current.mistakes).toBe(1);
  });

  it('marks won when all 4 groups solved', async () => {
    const { result } = renderHook(() => useConnections('c1'), { wrapper });
    await waitFor(() => expect(result.current.groups).toHaveLength(4));
    // Solve all 4 groups
    const allGroups = [
      ['apple', 'banana', 'cherry', 'date'],
      ['red', 'blue', 'green', 'yellow'],
      ['iron', 'copper', 'gold', 'silver'],
      ['mars', 'venus', 'jupiter', 'saturn'],
    ];
    for (const words of allGroups) {
      for (const w of words) act(() => result.current.toggle(w));
      act(() => result.current.submit());
    }
    expect(result.current.won).toBe(true);
    expect(result.current.done).toBe(true);
  });

  it('marks lost when mistakes reach maxMistakes', async () => {
    const { result } = renderHook(() => useConnections('c1'), { wrapper });
    await waitFor(() => expect(result.current.groups).toHaveLength(4));
    // Wrong guesses 4 times
    for (let i = 0; i < 4; i++) {
      act(() => result.current.toggle('apple'));
      act(() => result.current.toggle('red'));
      act(() => result.current.toggle('iron'));
      act(() => result.current.toggle('mars'));
      act(() => result.current.submit());
      act(() => result.current.deselectAll()); // clear after mistake
    }
    expect(result.current.mistakes).toBe(4);
    expect(result.current.lost).toBe(true);
    expect(result.current.done).toBe(true);
  });

  it('deselectAll clears selection', async () => {
    const { result } = renderHook(() => useConnections('c1'), { wrapper });
    await waitFor(() => expect(result.current.groups).toHaveLength(4));
    act(() => result.current.toggle('apple'));
    act(() => result.current.toggle('banana'));
    expect(result.current.selected).toHaveLength(2);
    act(() => result.current.deselectAll());
    expect(result.current.selected).toEqual([]);
  });
});
