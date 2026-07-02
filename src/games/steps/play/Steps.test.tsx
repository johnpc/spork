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
  path: ['cat'],
  current: 'cat',
  moves: 0,
  lastError: null,
  submit: vi.fn(),
  undo: vi.fn(),
  reset: vi.fn(),
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
  });

  it('shows an error message on an invalid move', () => {
    hook.state = { ...base, solved: false, lastError: 'not-one-letter' };
    renderSteps();
    expect(screen.getByTestId('steps-error')).toHaveTextContent('exactly one letter');
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
    expect(screen.queryByTestId('step-input')).not.toBeInTheDocument();
  });

  it('shows unavailable when the ladder is missing', () => {
    hook.state = { ...base, ladder: null, solved: false };
    renderSteps();
    expect(screen.getByTestId('steps-unavailable')).toBeInTheDocument();
  });
});
