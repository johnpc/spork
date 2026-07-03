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

// Verified mate-in-2 (Lichess): Black to move — 1...Re1+ 2.Kf2 Rf1#
const puzzle = {
  id: 'p1',
  name: 'Forced Mate (mate in 2)',
  position: '4r3/1k6/pp3P2/1b5p/3R1p2/P1R2P2/1P4PP/6K1 b - - 0 1',
  solution: JSON.stringify(['e8e1', 'g1f2', 'e1f1']),
  movesToWin: 2,
};

describe('useChessAttack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchPuzzle.mockResolvedValue(puzzle);
  });

  const ready = async () => {
    const view = renderHook(() => useChessAttack('p1'), { wrapper });
    await waitFor(() => expect(view.result.current.pieces.length).toBeGreaterThan(0));
    return view;
  };

  it('loads the board, side to move and total', async () => {
    const { result } = await ready();
    expect(result.current.solverSide).toBe('b');
    expect(result.current.total).toBe(2);
    expect(result.current.solved).toBe(false);
  });

  it('selects only a piece belonging to the side to move', async () => {
    const { result } = await ready();
    act(() => result.current.tap('d4')); // white rook — not the solver's
    expect(result.current.selected).toBeNull();
    act(() => result.current.tap('e8')); // black rook (solver)
    expect(result.current.selected).toBe('e8');
  });

  it('plays the mate: solver move + auto-played defender reply, to checkmate', async () => {
    const { result } = await ready();
    act(() => result.current.tap('e8'));
    act(() => result.current.tap('e1')); // 1...Re1+ ; engine auto-plays 2.Kf2
    expect(result.current.moves).toBe(1);
    expect(result.current.solved).toBe(false);
    act(() => result.current.tap('e1'));
    act(() => result.current.tap('f1')); // 2...Rf1#
    expect(result.current.solved).toBe(true);
  });

  it('flags a wrong move and clears the selection', async () => {
    const { result } = await ready();
    act(() => result.current.tap('e8'));
    act(() => result.current.tap('e2')); // not the expected e8e1
    expect(result.current.wrong).toBe(true);
    expect(result.current.moves).toBe(0);
    expect(result.current.selected).toBeNull();
  });

  it('deselects when tapping the selected square again', async () => {
    const { result } = await ready();
    act(() => result.current.tap('e8'));
    act(() => result.current.tap('e8'));
    expect(result.current.selected).toBeNull();
  });

  it('reset restores the initial position', async () => {
    const { result } = await ready();
    const before = result.current.pieces.length;
    act(() => result.current.tap('e8'));
    act(() => result.current.tap('e1'));
    act(() => result.current.reset());
    expect(result.current.moves).toBe(0);
    expect(result.current.pieces.length).toBe(before);
  });
});
