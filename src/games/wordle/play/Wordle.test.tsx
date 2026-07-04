import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hook = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('./useWordle', () => ({ useWordle: () => hook.state }));

const dailyGuard = vi.hoisted(() => ({ guard: null as string | null }));
vi.mock('../../shared/daily/useDailyGuard', () => ({
  useDailyGuard: () => dailyGuard.guard,
}));

vi.mock('../../shared/daily/useRecordDailyOnDone', () => ({
  useRecordDailyOnDone: vi.fn(),
}));

vi.mock('../../shared/daily/useElapsed', () => ({
  useElapsed: () => 10,
}));

import { Wordle } from './Wordle';

const renderWordle = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/wordle/w1']}>
        <Route path="/wordle/:id">
          <Wordle />
        </Route>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const puzzle = {
  id: 'w1',
  answer: 'crane',
  wordLength: 5,
  maxGuesses: 6,
  status: 'PUBLISHED',
};

const base = {
  puzzle,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  guesses: [],
  current: '',
  status: 'playing' as const,
  won: false,
  gameOver: false,
  invalidWord: false,
  type: vi.fn(),
  backspace: vi.fn(),
  submitGuess: vi.fn(),
};

describe('Wordle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dailyGuard.guard = null;
  });

  it('shows the board and keyboard while playing', () => {
    hook.state = base;
    renderWordle();
    expect(screen.getByTestId('wordle')).toBeInTheDocument();
    expect(screen.getByTestId('wordle-board')).toBeInTheDocument();
    expect(screen.getByTestId('wordle-keyboard')).toBeInTheDocument();
  });

  it('shows the intro text with word length and max guesses', () => {
    hook.state = base;
    renderWordle();
    expect(screen.getByText(/Guess the word in 6 tries/)).toBeInTheDocument();
    expect(screen.getByText(/5-letter word/)).toBeInTheDocument();
  });

  it('shows error message for invalid word', () => {
    hook.state = { ...base, invalidWord: true };
    renderWordle();
    const error = screen.getByTestId('wordle-error');
    expect(error).toHaveTextContent('Not in word list');
    expect(error).toHaveAttribute('role', 'alert');
  });

  it('shows won message when status is won', () => {
    hook.state = {
      ...base,
      status: 'won',
      won: true,
      gameOver: true,
      guesses: ['crane'],
    };
    renderWordle();
    const result = screen.getByTestId('wordle-won');
    expect(result).toHaveTextContent('You won in 1 guesses!');
    expect(result).toHaveAttribute('role', 'status');
  });

  it('shows lost message with answer when status is lost', () => {
    hook.state = {
      ...base,
      status: 'lost',
      gameOver: true,
      guesses: ['hello', 'world', 'pizza', 'quest', 'magic', 'space'],
    };
    renderWordle();
    const result = screen.getByTestId('wordle-lost');
    expect(result).toHaveTextContent('The word was CRANE');
    expect(result).toHaveAttribute('role', 'status');
  });

  it('shows unavailable message when puzzle is null', () => {
    hook.state = { ...base, puzzle: null };
    renderWordle();
    expect(screen.getByTestId('wordle-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('wordle')).not.toBeInTheDocument();
  });

  it('passes correct props to WordleBoard', () => {
    hook.state = { ...base, guesses: ['crane'], current: 'cr' };
    renderWordle();
    const board = screen.getByTestId('wordle-board');
    expect(board).toBeInTheDocument();
  });

  it('passes correct props to WordleKeyboard', () => {
    hook.state = base;
    renderWordle();
    const keyboard = screen.getByTestId('wordle-keyboard');
    expect(keyboard).toBeInTheDocument();
  });

  it('disables keyboard when game is over', () => {
    hook.state = { ...base, gameOver: true, status: 'won', won: true };
    renderWordle();
    const enterKey = screen.getByTestId('wordle-key-enter');
    expect(enterKey).toBeDisabled();
  });
});
