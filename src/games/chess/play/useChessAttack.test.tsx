import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({ fetchPuzzle: vi.fn() }));
vi.mock('./chessApi', () => api);

import { useChessAttack } from './useChessAttack';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const puzzle = {
  id: 'p1',
  name: 'Clear the Rank',
  position: JSON.stringify({
    size: 5,
    pieces: [
      { sq: 'a1', piece: 'R', side: 'w' },
      { sq: 'a5', piece: 'P', side: 'b' },
      { sq: 'e5', piece: 'K', side: 'b' },
    ],
    toMove: 'w',
    goal: 'Capture the black king in two moves',
  }),
  solution: JSON.stringify(['a1a5', 'a5e5']),
};

describe('useChessAttack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchPuzzle.mockResolvedValue(puzzle);
  });

  const ready = async () => {
    const view = renderHook(() => useChessAttack('p1'), { wrapper });
    await waitFor(() => expect(view.result.current.pieces).toHaveLength(3));
    return view;
  };

  it('loads the board, goal and total', async () => {
    const { result } = await ready();
    expect(result.current.goal).toContain('two moves');
    expect(result.current.total).toBe(2);
    expect(result.current.solved).toBe(false);
  });

  it('selects only a piece belonging to the side to move', async () => {
    const { result } = await ready();
    act(() => result.current.tap('a5')); // black pawn — not selectable
    expect(result.current.selected).toBeNull();
    act(() => result.current.tap('a1')); // white rook
    expect(result.current.selected).toBe('a1');
  });

  it('plays the solution to solved, capturing along the way', async () => {
    const { result } = await ready();
    act(() => result.current.tap('a1'));
    act(() => result.current.tap('a5')); // a1a5 captures pawn
    expect(result.current.moves).toBe(1);
    act(() => result.current.tap('a5'));
    act(() => result.current.tap('e5')); // a5e5 captures king
    expect(result.current.solved).toBe(true);
    expect(result.current.pieces).toEqual([{ sq: 'e5', piece: 'R', side: 'w' }]);
  });

  it('flags a wrong move and clears the selection', async () => {
    const { result } = await ready();
    act(() => result.current.tap('a1'));
    act(() => result.current.tap('a2')); // not the expected a1a5
    expect(result.current.wrong).toBe(true);
    expect(result.current.moves).toBe(0);
    expect(result.current.selected).toBeNull();
  });

  it('deselects when tapping the selected square again', async () => {
    const { result } = await ready();
    act(() => result.current.tap('a1'));
    act(() => result.current.tap('a1'));
    expect(result.current.selected).toBeNull();
  });

  it('reset restores the initial board', async () => {
    const { result } = await ready();
    act(() => result.current.tap('a1'));
    act(() => result.current.tap('a5'));
    act(() => result.current.reset());
    expect(result.current.moves).toBe(0);
    expect(result.current.pieces).toHaveLength(3);
  });

  it('ignores taps once solved', async () => {
    const { result } = await ready();
    act(() => result.current.tap('a1'));
    act(() => result.current.tap('a5'));
    act(() => result.current.tap('a5'));
    act(() => result.current.tap('e5'));
    expect(result.current.solved).toBe(true);
    act(() => result.current.tap('e5'));
    expect(result.current.selected).toBeNull();
  });
});
