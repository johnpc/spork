import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayControls } from './PlayControls';

const base = {
  typed: true,
  best: null,
  score: { found: 0, total: 10 },
  submit: () => false,
  start: vi.fn(),
  giveUp: vi.fn(),
  onReplay: vi.fn(),
};

describe('PlayControls', () => {
  it('typed + idle: shows Start (and best when set)', () => {
    render(<PlayControls {...base} status="idle" best={7} />);
    expect(screen.getByTestId('play-start')).toBeInTheDocument();
    expect(screen.getByTestId('play-best')).toHaveTextContent('7 / 10');
  });

  it('click mode + idle: no Start, but Give Up is available (auto-start)', () => {
    render(<PlayControls {...base} typed={false} status="idle" />);
    expect(screen.queryByTestId('play-start')).not.toBeInTheDocument();
    expect(screen.getByTestId('play-giveup')).toBeInTheDocument();
  });

  it('typed + running: shows the input and Give Up', () => {
    render(<PlayControls {...base} status="running" />);
    expect(screen.getByTestId('play-input')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('play-giveup'));
    expect(base.giveUp).toHaveBeenCalled();
  });

  it('done: shows the score summary and replays', () => {
    const onReplay = vi.fn();
    render(
      <PlayControls {...base} status="done" score={{ found: 3, total: 10 }} onReplay={onReplay} />,
    );
    expect(screen.getByTestId('play-done')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('play-replay'));
    expect(onReplay).toHaveBeenCalled();
  });
});
