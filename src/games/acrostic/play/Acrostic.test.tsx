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
  revealed: ['__', '__', '__', '___'],
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

  it('renders the clue list + progress while unsolved', () => {
    hook.state = base;
    renderAcrostic();
    expect(screen.getByTestId('acrostic-progress')).toHaveTextContent('0 / 2');
    expect(screen.getByTestId('clue-list')).toBeInTheDocument();
    expect(screen.getByTestId('quote')).toHaveTextContent('__');
  });

  it('shows the solved banner + author and hides clues when complete', () => {
    hook.state = {
      ...base,
      solved: new Set([0, 1]),
      revealed: ['Do', 'or', 'do', 'not'],
      solvedCount: 2,
      complete: true,
    };
    renderAcrostic();
    expect(screen.getByTestId('acrostic-solved')).toBeInTheDocument();
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
