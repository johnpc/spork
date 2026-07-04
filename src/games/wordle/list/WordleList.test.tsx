import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WordlePuzzle } from '../play/wordleApi';

const hook = vi.hoisted(() => ({
  state: {} as {
    puzzles: WordlePuzzle[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  },
}));
vi.mock('./useWordles', () => ({ useWordles: () => hook.state }));

import { WordleList } from './WordleList';

const renderList = () =>
  render(
    <MemoryRouter>
      <WordleList />
    </MemoryRouter>,
  );

describe('WordleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists puzzles with links into play', () => {
    hook.state = {
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      puzzles: [
        {
          id: 'w1',
          answer: 'crane',
          wordLength: 5,
          maxGuesses: 6,
          status: 'PUBLISHED',
          puzzleDate: '2026-07-01',
        },
      ],
    };
    renderList();
    const link = screen.getByTestId('wordle-link');
    expect(link).toHaveAttribute('href', '/wordle/w1');
    expect(link).toHaveTextContent('2026-07-01');
  });

  it('shows fallback text when puzzleDate is missing', () => {
    hook.state = {
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      puzzles: [
        {
          id: 'w2',
          answer: 'crane',
          wordLength: 5,
          maxGuesses: 6,
          status: 'PUBLISHED',
          puzzleDate: null,
        },
      ],
    };
    renderList();
    expect(screen.getByText('Daily Puzzle')).toBeInTheDocument();
  });

  it('shows empty message when there are no puzzles', () => {
    hook.state = {
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      puzzles: [],
    };
    renderList();
    expect(screen.getByTestId('load-empty')).toBeInTheDocument();
  });

  it('renders multiple puzzles', () => {
    hook.state = {
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      puzzles: [
        {
          id: 'w1',
          answer: 'crane',
          wordLength: 5,
          maxGuesses: 6,
          status: 'PUBLISHED',
          puzzleDate: '2026-07-01',
        },
        {
          id: 'w2',
          answer: 'hello',
          wordLength: 5,
          maxGuesses: 6,
          status: 'PUBLISHED',
          puzzleDate: '2026-07-02',
        },
      ],
    };
    renderList();
    const links = screen.getAllByTestId('wordle-link');
    expect(links).toHaveLength(2);
  });

  it('shows loading state', () => {
    hook.state = {
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
      puzzles: [],
    };
    renderList();
    expect(screen.getByTestId('load-loading')).toBeInTheDocument();
  });
});
