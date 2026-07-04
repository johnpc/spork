import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AcrosticClues } from './AcrosticClues';

describe('AcrosticClues', () => {
  const baseProps = {
    clues: [
      { clue: 'A feline', answer: 'cat' },
      { clue: 'Frozen water', answer: 'ice' },
    ],
    solved: new Set<number>(),
    lastWrong: null,
    onGuess: vi.fn(),
    onGiveUp: vi.fn(),
  };

  it('renders the clue list and give-up button', () => {
    render(<AcrosticClues {...baseProps} />);
    expect(screen.getByTestId('clue-list')).toBeInTheDocument();
    expect(screen.getByTestId('acrostic-give-up')).toBeInTheDocument();
  });

  it('calls onGiveUp when give-up button is clicked', async () => {
    const user = userEvent.setup();
    render(<AcrosticClues {...baseProps} />);
    await user.click(screen.getByTestId('acrostic-give-up'));
    expect(baseProps.onGiveUp).toHaveBeenCalledOnce();
  });
});
