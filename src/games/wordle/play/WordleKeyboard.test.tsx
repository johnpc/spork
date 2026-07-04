import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WordleKeyboard } from './WordleKeyboard';

describe('WordleKeyboard', () => {
  const onType = vi.fn();
  const onBackspace = vi.fn();
  const onEnter = vi.fn();

  const renderKeyboard = (guesses: string[] = [], disabled = false) =>
    render(
      <WordleKeyboard
        guesses={guesses}
        answer="crane"
        onType={onType}
        onBackspace={onBackspace}
        onEnter={onEnter}
        disabled={disabled}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all letter keys', () => {
    renderKeyboard();
    expect(screen.getByTestId('wordle-keyboard')).toBeInTheDocument();
    expect(screen.getByTestId('wordle-key-q')).toBeInTheDocument();
    expect(screen.getByTestId('wordle-key-z')).toBeInTheDocument();
  });

  it('renders enter and backspace keys', () => {
    renderKeyboard();
    expect(screen.getByTestId('wordle-key-enter')).toBeInTheDocument();
    expect(screen.getByTestId('wordle-key-backspace')).toBeInTheDocument();
  });

  it('calls onType when a letter is clicked', () => {
    renderKeyboard();
    fireEvent.click(screen.getByTestId('wordle-key-a'));
    expect(onType).toHaveBeenCalledWith('a');
  });

  it('calls onEnter when Enter is clicked', () => {
    renderKeyboard();
    fireEvent.click(screen.getByTestId('wordle-key-enter'));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('calls onBackspace when backspace is clicked', () => {
    renderKeyboard();
    fireEvent.click(screen.getByTestId('wordle-key-backspace'));
    expect(onBackspace).toHaveBeenCalledTimes(1);
  });

  it('disables all keys when disabled prop is true', () => {
    renderKeyboard([], true);
    expect(screen.getByTestId('wordle-key-a')).toBeDisabled();
    expect(screen.getByTestId('wordle-key-enter')).toBeDisabled();
  });

  it('applies correct state classes to used letters', () => {
    renderKeyboard(['crate']);
    const keyC = screen.getByTestId('wordle-key-c');
    expect(keyC).toHaveClass('wordle-keyboard__key--correct');
  });

  it('applies present state to misplaced letters', () => {
    renderKeyboard(['crane']);
    const keyE = screen.getByTestId('wordle-key-e');
    expect(keyE).toHaveClass('wordle-keyboard__key--correct');
  });

  it('applies absent state to wrong letters', () => {
    renderKeyboard(['hello']);
    const keyH = screen.getByTestId('wordle-key-h');
    expect(keyH).toHaveClass('wordle-keyboard__key--absent');
  });

  it('wires physical keyboard Enter', () => {
    renderKeyboard();
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onEnter).toHaveBeenCalled();
  });

  it('wires physical keyboard Backspace', () => {
    renderKeyboard();
    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(onBackspace).toHaveBeenCalled();
  });

  it('wires physical keyboard letter keys', () => {
    renderKeyboard();
    fireEvent.keyDown(window, { key: 'a' });
    expect(onType).toHaveBeenCalledWith('a');
  });

  it('normalizes uppercase physical keys to lowercase', () => {
    renderKeyboard();
    fireEvent.keyDown(window, { key: 'A' });
    expect(onType).toHaveBeenCalledWith('a');
  });

  it('ignores physical keyboard when disabled', () => {
    renderKeyboard([], true);
    fireEvent.keyDown(window, { key: 'a' });
    expect(onType).not.toHaveBeenCalled();
  });

  it('ignores non-letter physical keys', () => {
    renderKeyboard();
    fireEvent.keyDown(window, { key: '1' });
    fireEvent.keyDown(window, { key: 'Shift' });
    expect(onType).not.toHaveBeenCalled();
  });
});
