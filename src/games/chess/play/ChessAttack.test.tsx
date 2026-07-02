import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Piece } from './chess';

const hook = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('./useChessAttack', () => ({ useChessAttack: () => hook.state }));

import { ChessAttack } from './ChessAttack';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/chess/p1']}>
      <ChessAttack />
    </MemoryRouter>,
  );

const pieces: Piece[] = [{ sq: 'a1', piece: 'R', side: 'w' }];
const base = {
  puzzle: { id: 'p1', name: 'Rook Takes All' },
  isLoading: false,
  size: 5,
  goal: 'Capture the black king in one move',
  pieces,
  selected: null,
  wrong: false,
  moves: 0,
  total: 1,
  tap: vi.fn(),
  reset: vi.fn(),
};

describe('ChessAttack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the goal + board + hint while unsolved', () => {
    hook.state = { ...base, solved: false };
    renderPage();
    expect(screen.getByTestId('chess-goal')).toHaveTextContent('Capture the black king');
    expect(screen.getByTestId('chess-board')).toBeInTheDocument();
    expect(screen.getByTestId('chess-hint')).toBeInTheDocument();
  });

  it('shows the try-again message on a wrong move', () => {
    hook.state = { ...base, solved: false, wrong: true };
    renderPage();
    expect(screen.getByTestId('chess-error')).toHaveTextContent('Try again');
  });

  it('shows the solved banner when solved', () => {
    hook.state = { ...base, moves: 1, solved: true };
    renderPage();
    expect(screen.getByTestId('chess-solved')).toBeInTheDocument();
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
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});
