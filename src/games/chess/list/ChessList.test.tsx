import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ChessAttackRecord } from '../../../lib/dataClient';

const hook = vi.hoisted(() => ({
  state: {} as { puzzles: ChessAttackRecord[]; isLoading: boolean },
}));
vi.mock('./useChessPuzzles', () => ({ useChessPuzzles: () => hook.state }));

import { ChessList } from './ChessList';

const renderList = () =>
  render(
    <MemoryRouter>
      <ChessList />
    </MemoryRouter>,
  );

describe('ChessList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists puzzles with a link into play', () => {
    hook.state = {
      isLoading: false,
      puzzles: [{ id: 'p1', name: 'Rook Takes All', difficulty: 'EASY' } as ChessAttackRecord],
    };
    renderList();
    const link = screen.getByTestId('chess-link');
    expect(link).toHaveAttribute('href', '/chess/p1');
    expect(link).toHaveTextContent('Rook Takes All');
  });

  it('shows an empty message when there are none', () => {
    hook.state = { isLoading: false, puzzles: [] };
    renderList();
    expect(screen.getByTestId('load-empty')).toBeInTheDocument();
  });

  it('shows a loading message while loading', () => {
    hook.state = { isLoading: true, puzzles: [] };
    renderList();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});
