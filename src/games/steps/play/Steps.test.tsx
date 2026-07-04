import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hook = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('./useLadder', () => ({ useLadder: () => hook.state }));

import { Steps } from './Steps';

const renderSteps = () =>
  render(
    <MemoryRouter initialEntries={['/steps/l1']}>
      <Steps />
    </MemoryRouter>,
  );

const base = {
  ladder: { id: 'l1' },
  isLoading: false,
  start: 'cat',
  target: 'dog',
  par: 3,
  parPath: ['cat', 'cot', 'cog', 'dog'],
  path: ['cat'],
  current: 'cat',
  moves: 0,
  gaveUp: false,
  lastError: null,
  submit: vi.fn(),
  undo: vi.fn(),
  reset: vi.fn(),
  giveUp: vi.fn(),
};

describe('Steps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the goal + input while unsolved', () => {
    hook.state = { ...base, solved: false };
    renderSteps();
    expect(screen.getByTestId('steps-goal')).toHaveTextContent('CAT');
    expect(screen.getByTestId('step-input')).toBeInTheDocument();
    // First-timer onboarding: the one-letter rule is stated up front.
    expect(screen.getByText(/Change/)).toHaveTextContent('Change one letter at a time');
  });

  it('shows an error message on an invalid move', () => {
    hook.state = { ...base, solved: false, lastError: 'not-one-letter' };
    renderSteps();
    expect(screen.getByTestId('steps-error')).toHaveTextContent('exactly one letter');
    // Assertive so a screen reader hears the rejected move immediately.
    expect(screen.getByTestId('steps-error')).toHaveAttribute('role', 'alert');
  });

  it('shows the solved banner and hides the input when solved', () => {
    hook.state = {
      ...base,
      path: ['cat', 'cot', 'cog', 'dog'],
      current: 'dog',
      moves: 3,
      solved: true,
    };
    renderSteps();
    expect(screen.getByTestId('steps-solved')).toBeInTheDocument();
    expect(screen.getByTestId('steps-solved')).toHaveAttribute('role', 'status');
    expect(screen.queryByTestId('step-input')).not.toBeInTheDocument();
  });

  it('shows unavailable when the ladder is missing', () => {
    hook.state = { ...base, ladder: null, solved: false };
    renderSteps();
    expect(screen.getByTestId('steps-unavailable')).toBeInTheDocument();
  });

  it('shows the give-up button while playing', () => {
    hook.state = { ...base, solved: false, gaveUp: false };
    renderSteps();
    expect(screen.getByTestId('steps-giveup')).toBeInTheDocument();
  });

  it('reveals the solution and hides input after give-up', () => {
    hook.state = { ...base, solved: false, gaveUp: true };
    renderSteps();
    expect(screen.getByTestId('steps-solution')).toBeInTheDocument();
    expect(screen.queryByTestId('step-input')).not.toBeInTheDocument();
    // The solution contains all par-path words in order.
    const solution = screen.getByTestId('steps-solution');
    expect(solution).toHaveTextContent('CAT');
    expect(solution).toHaveTextContent('COT');
    expect(solution).toHaveTextContent('COG');
    expect(solution).toHaveTextContent('DOG');
  });
});
