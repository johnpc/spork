import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SpellingBeePuzzleRecord } from '../../../lib/dataClient';

const hook = vi.hoisted(() => ({
  state: {} as {
    bees: SpellingBeePuzzleRecord[];
    isLoading: boolean;
    isError?: boolean;
    refetch?: () => void;
  },
}));
vi.mock('./useBees', () => ({ useBees: () => hook.state }));

import { BeeList } from './BeeList';

const renderList = () =>
  render(
    <MemoryRouter>
      <BeeList />
    </MemoryRouter>,
  );

describe('BeeList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists puzzles with a link into play', () => {
    hook.state = {
      isLoading: false,
      bees: [
        {
          id: 'b1',
          letters: 'abcdefg',
          centerLetter: 'a',
          puzzleDate: '2026-07-04',
        } as SpellingBeePuzzleRecord,
      ],
    };
    renderList();
    const link = screen.getByTestId('bee-link');
    expect(link).toHaveAttribute('href', '/spellingbee/b1');
    expect(link).toHaveTextContent('ABCDEFG · A');
    expect(link).toHaveTextContent('2026-07-04');
  });

  it('shows an empty message when there are none', () => {
    hook.state = { isLoading: false, bees: [], isError: false, refetch: vi.fn() };
    renderList();
    expect(screen.getByTestId('load-empty')).toBeInTheDocument();
  });
});
