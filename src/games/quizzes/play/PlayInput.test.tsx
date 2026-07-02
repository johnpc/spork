import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayInput } from './PlayInput';

describe('PlayInput', () => {
  it('submits the typed guess and clears on a hit', () => {
    const onSubmit = vi.fn().mockReturnValue(true);
    render(<PlayInput onSubmit={onSubmit} />);
    const box = screen.getByTestId('play-input') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'Brazil' } });
    fireEvent.submit(box.closest('form') as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledWith('Brazil');
    expect(box.value).toBe(''); // cleared on hit
    expect(box.className).toContain('play-input__box--hit');
  });

  it('keeps the text and flashes miss on a wrong guess', () => {
    const onSubmit = vi.fn().mockReturnValue(false);
    render(<PlayInput onSubmit={onSubmit} />);
    const box = screen.getByTestId('play-input') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'Narnia' } });
    fireEvent.submit(box.closest('form') as HTMLFormElement);
    expect(box.value).toBe('Narnia');
    expect(box.className).toContain('play-input__box--miss');
  });

  it('ignores empty submissions', () => {
    const onSubmit = vi.fn();
    render(<PlayInput onSubmit={onSubmit} />);
    const box = screen.getByTestId('play-input') as HTMLInputElement;
    fireEvent.submit(box.closest('form') as HTMLFormElement);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('live mode: matches on each keystroke and clears on a hit (no Enter)', () => {
    // Correct only when the full word is typed.
    const onSubmit = vi.fn((g: string) => g === 'brazil');
    render(<PlayInput onSubmit={onSubmit} live />);
    const box = screen.getByTestId('play-input') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'bra' } });
    expect(box.value).toBe('bra'); // no match yet, text kept
    fireEvent.change(box, { target: { value: 'brazil' } });
    expect(onSubmit).toHaveBeenLastCalledWith('brazil');
    expect(box.value).toBe(''); // cleared on the live hit — no Enter needed
  });
});
