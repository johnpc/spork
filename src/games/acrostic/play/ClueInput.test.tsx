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

  it('submits the typed answer and clears on success', () => {
    const onGuess = vi.fn().mockReturnValue(true);
    render(<ClueInput {...props} onGuess={onGuess} />);
    const box = screen.getByTestId('clue-input-0') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'cat' } });
    fireEvent.submit(box.closest('form') as HTMLFormElement);
    expect(onGuess).toHaveBeenCalledWith(0, 'cat');
    expect(box.value).toBe('');
  });

  it('keeps the text on a wrong guess', () => {
    const onGuess = vi.fn().mockReturnValue(false);
    render(<ClueInput {...props} onGuess={onGuess} />);
    const box = screen.getByTestId('clue-input-0') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'dog' } });
    fireEvent.submit(box.closest('form') as HTMLFormElement);
    expect(box.value).toBe('dog');
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
