import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StepsContent } from './StepsContent';
import type { useLadder } from './useLadder';

const base: ReturnType<typeof useLadder> = {
  ladder: { id: 'l1' } as never,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  start: 'cat',
  target: 'dog',
  par: 3,
  parPath: ['cat', 'cot', 'cog', 'dog'],
  path: ['cat'],
  current: 'cat',
  moves: 0,
  solved: false,
  gaveUp: false,
  lastError: null,
  submit: vi.fn(),
  undo: vi.fn(),
  reset: vi.fn(),
  giveUp: vi.fn(),
};

describe('StepsContent', () => {
  it('shows unavailable when the ladder is missing', () => {
    render(<StepsContent l={{ ...base, ladder: null }} />);
    expect(screen.getByTestId('steps-unavailable')).toBeInTheDocument();
  });

  it('shows the goal and give-up button while playing', () => {
    render(<StepsContent l={base} />);
    expect(screen.getByTestId('steps-goal')).toHaveTextContent('CAT');
    expect(screen.getByTestId('steps-giveup')).toBeInTheDocument();
  });

  it('reveals the solution after give-up', () => {
    render(<StepsContent l={{ ...base, gaveUp: true }} />);
    expect(screen.getByTestId('steps-solution')).toBeInTheDocument();
    expect(screen.queryByTestId('step-input')).not.toBeInTheDocument();
  });
});
