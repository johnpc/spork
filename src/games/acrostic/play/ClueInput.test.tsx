import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClueInput } from './ClueInput';

const props = {
  index: 0,
  clue: 'A feline',
  answer: 'cat',
  solved: false,
  wrong: false,
  onGuess: vi.fn(),
};

describe('ClueInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches LIVE as you type (no Enter) and clears on success', () => {
    const onGuess = vi.fn().mockReturnValue(true);
    render(<ClueInput {...props} onGuess={onGuess} />);
    const box = screen.getByTestId('clue-input-0') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'cat' } });
    // Live check is silent (flagWrong=false) and clears the box on a solve.
    expect(onGuess).toHaveBeenCalledWith(0, 'cat', false);
    expect(box.value).toBe('');
  });

  it('keeps the text on a wrong guess (live check does not clear)', () => {
    const onGuess = vi.fn().mockReturnValue(false);
    render(<ClueInput {...props} onGuess={onGuess} />);
    const box = screen.getByTestId('clue-input-0') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'dog' } });
    expect(box.value).toBe('dog');
  });

  it('flags wrong on an explicit submit (Enter)', () => {
    const onGuess = vi.fn().mockReturnValue(false);
    render(<ClueInput {...props} onGuess={onGuess} />);
    const box = screen.getByTestId('clue-input-0') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'dog' } });
    fireEvent.submit(box.closest('form') as HTMLFormElement);
    // Submit calls onGuess with the default (flagWrong=true) so the clue flashes.
    expect(onGuess).toHaveBeenLastCalledWith(0, 'dog');
  });

  it('ignores an empty submit', () => {
    const onGuess = vi.fn();
    render(<ClueInput {...props} onGuess={onGuess} />);
    const box = screen.getByTestId('clue-input-0');
    fireEvent.submit(box.closest('form') as HTMLFormElement);
    expect(onGuess).not.toHaveBeenCalled();
  });

  it('shows the revealed answer instead of the input when solved', () => {
    render(<ClueInput {...props} solved />);
    expect(screen.getByTestId('clue-answer')).toHaveTextContent('CAT');
    expect(screen.queryByTestId('clue-input-0')).not.toBeInTheDocument();
  });

  it('marks the box wrong when flagged', () => {
    render(<ClueInput {...props} wrong />);
    expect(screen.getByTestId('clue-input-0').className).toContain('clue-input__box--wrong');
  });
});
