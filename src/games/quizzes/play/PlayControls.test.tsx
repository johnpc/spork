import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { PlayControls } from './PlayControls';

const base = {
  typed: true,
  best: null,
  score: { found: 0, total: 10 },
  timeSeconds: 0,
  submit: () => false,
  start: vi.fn(),
  giveUp: vi.fn(),
};

const renderControls = (props: Parameters<typeof PlayControls>[0]) =>
  render(
    <MemoryRouter>
      <PlayControls {...props} />
    </MemoryRouter>,
  );

describe('PlayControls', () => {
  it('typed + idle: shows Start (and best when set)', () => {
    renderControls({ ...base, status: 'idle', best: 7 });
    expect(screen.getByTestId('play-start')).toBeInTheDocument();
    expect(screen.getByTestId('play-best')).toHaveTextContent('7 / 10');
  });

  it('click mode + idle: no Start, but Give Up is available (auto-start)', () => {
    renderControls({ ...base, typed: false, status: 'idle' });
    expect(screen.queryByTestId('play-start')).not.toBeInTheDocument();
    expect(screen.getByTestId('play-giveup')).toBeInTheDocument();
  });

  it('typed + running: shows the input and Give Up', () => {
    renderControls({ ...base, status: 'running' });
    expect(screen.getByTestId('play-input')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('play-giveup'));
    expect(base.giveUp).toHaveBeenCalled();
  });

  it('done: shows the score summary with time and a way back home (no replay)', () => {
    renderControls({ ...base, status: 'done', score: { found: 3, total: 10 }, timeSeconds: 42 });
    expect(screen.getByTestId('play-done')).toBeInTheDocument();
    expect(screen.getByText(/0:42/)).toBeInTheDocument();
    expect(screen.queryByTestId('play-replay')).not.toBeInTheDocument();
    expect(screen.getByTestId('play-home')).toHaveAttribute('href', '/home');
  });
});
