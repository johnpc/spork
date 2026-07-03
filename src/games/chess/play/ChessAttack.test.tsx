import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BoardPiece } from './chess';

const hook = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('./useChessAttack', () => ({ useChessAttack: () => hook.state }));

import { ChessAttack } from './ChessAttack';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/chess/p1']}>
      <ChessAttack />
    </MemoryRouter>,
  );

const pieces: BoardPiece[] = [{ sq: 'a1', type: 'r', color: 'w' }];
const base = {
  puzzle: { id: 'p1', name: 'Forced Mate (mate in 2)' },
  isLoading: false,
  isError: false,
  fen: '6k1/8/8/8/8/8/8/R5K1 w - - 0 1',
  pieces,
  selected: null,
  targets: [],
  solverSide: 'w' as const,
  wrong: false,
  moves: 0,
  total: 2,
  tap: vi.fn(),
  reset: vi.fn(),
};

describe('ChessAttack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear(); // the daily guard reads localStorage — isolate cases
  });

  it('shows the mate-in-N goal + board + hint while unsolved', () => {
    hook.state = { ...base, solved: false };
    renderPage();
    expect(screen.getByTestId('chess-goal')).toHaveTextContent('White to move · mate in 2');
    expect(screen.getByTestId('chess-board')).toBeInTheDocument();
    expect(screen.getByTestId('chess-hint')).toBeInTheDocument();
  });

  it('shows the try-again message on a wrong move', () => {
    hook.state = { ...base, solved: false, wrong: true };
    renderPage();
    expect(screen.getByTestId('chess-error')).toHaveTextContent('try again');
    expect(screen.getByTestId('chess-error')).toHaveAttribute('role', 'alert');
  });

  it('shows the checkmate banner when solved', () => {
    hook.state = { ...base, moves: 2, solved: true };
    renderPage();
    expect(screen.getByTestId('chess-solved')).toHaveTextContent('Checkmate');
    expect(screen.getByTestId('chess-solved')).toHaveAttribute('role', 'status');
    expect(screen.queryByTestId('chess-hint')).not.toBeInTheDocument();
  });

  it('shows unavailable when the puzzle is missing', () => {
    hook.state = { ...base, puzzle: null, solved: false };
    renderPage();
    expect(screen.getByTestId('chess-unavailable')).toBeInTheDocument();
  });

  it('shows a loading message while loading', () => {
    hook.state = { ...base, isLoading: true, solved: false };
    renderPage();
    expect(screen.getByTestId('load-loading')).toBeInTheDocument();
  });
});
