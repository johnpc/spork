import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hook = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('./useSpellingBee', () => ({ useSpellingBee: () => hook.state }));
vi.mock('../../shared/daily/useRecordDailyOnDone', () => ({
  useRecordDailyOnDone: vi.fn(),
}));
vi.mock('../../shared/daily/useDailyGuard', () => ({
  useDailyGuard: () => null,
}));

import { SpellingBee } from './SpellingBee';

const renderSpellingBee = () =>
  render(
    <MemoryRouter initialEntries={['/spellingbee/b1']}>
      <SpellingBee />
    </MemoryRouter>,
  );

const base = {
  bee: { id: 'b1', letters: 'abcdefg', centerLetter: 'a' },
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  centerLetter: 'a',
  outerOrder: ['b', 'c', 'd', 'e', 'f', 'g'],
  answers: ['abc', 'def'],
  pangrams: [],
  current: '',
  found: [],
  score: 0,
  done: false,
  type: vi.fn(),
  backspace: vi.fn(),
  shuffleOuter: vi.fn(),
  submit: vi.fn(),
};

describe('SpellingBee', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the play area when a puzzle is loaded', () => {
    hook.state = { ...base };
    renderSpellingBee();
    expect(screen.getByTestId('spelling-bee')).toBeInTheDocument();
    expect(screen.getByTestId('hive')).toBeInTheDocument();
  });

  it('shows unavailable message when the puzzle is missing', () => {
    hook.state = { ...base, bee: null };
    renderSpellingBee();
    expect(screen.getByTestId('bee-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('spelling-bee')).not.toBeInTheDocument();
  });

  it('passes correct props to BeePlayArea', () => {
    hook.state = { ...base, current: 'abc', found: ['def'], score: 5 };
    renderSpellingBee();
    expect(screen.getByTestId('bee-input')).toHaveTextContent('ABC');
    expect(screen.getByTestId('bee-score')).toHaveTextContent('Score: 5');
    expect(screen.getByTestId('bee-found-word')).toHaveTextContent('DEF');
  });
});
