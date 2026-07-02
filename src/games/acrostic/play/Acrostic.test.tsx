import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hook = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('./useAcrostic', () => ({ useAcrostic: () => hook.state }));

import { Acrostic } from './Acrostic';

const renderAcrostic = () =>
  render(
    <MemoryRouter initialEntries={['/acrostic/a1']}>
      <Acrostic />
    </MemoryRouter>,
  );

const base = {
  acrostic: { id: 'a1', title: 'On Trying' },
  isLoading: false,
  clues: [
    { clue: 'A feline', answer: 'cat' },
    { clue: 'Frozen water', answer: 'ice' },
  ],
  quote: 'Do or do not',
  author: 'Yoda',
  solved: new Set<number>(),
  slots: [
    { letter: 'C', revealed: false },
    { letter: 'I', revealed: false },
  ],
  secret: 'CI',
  solvedCount: 0,
  total: 2,
  complete: false,
  lastWrong: null,
  guess: vi.fn(),
  reset: vi.fn(),
};

describe('Acrostic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the clue list + progress + masked secret word while unsolved', () => {
    hook.state = base;
    renderAcrostic();
    expect(screen.getByTestId('acrostic-progress')).toHaveTextContent('0 / 2');
    expect(screen.getByTestId('clue-list')).toBeInTheDocument();
    expect(screen.getByTestId('secret-word')).toBeInTheDocument();
    expect(screen.getAllByTestId('secret-blank')).toHaveLength(2);
  });

  it('shows the solved banner + secret word + quote and hides clues when complete', () => {
    hook.state = {
      ...base,
      solved: new Set([0, 1]),
      slots: [
        { letter: 'C', revealed: true },
        { letter: 'I', revealed: true },
      ],
      solvedCount: 2,
      complete: true,
    };
    renderAcrostic();
    expect(screen.getByTestId('acrostic-solved')).toHaveTextContent('CI');
    expect(screen.getByTestId('secret-quote')).toBeInTheDocument();
    expect(screen.getByTestId('quote-author')).toHaveTextContent('Yoda');
    expect(screen.queryByTestId('clue-list')).not.toBeInTheDocument();
  });

  it('shows unavailable when the puzzle is missing', () => {
    hook.state = { ...base, acrostic: null };
    renderAcrostic();
    expect(screen.getByTestId('acrostic-unavailable')).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    hook.state = { ...base, isLoading: true };
    renderAcrostic();
    expect(screen.queryByTestId('acrostic')).not.toBeInTheDocument();
  });
});
