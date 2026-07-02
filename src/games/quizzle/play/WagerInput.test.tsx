import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WagerInput } from './WagerInput';

describe('WagerInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults to the whole bank and submits the entered wager', () => {
    const onWager = vi.fn();
    render(<WagerInput bank={1000} onWager={onWager} />);
    const box = screen.getByTestId('wager-input');
    expect(box).toHaveValue(1000);
    fireEvent.change(box, { target: { value: '400' } });
    fireEvent.click(screen.getByTestId('wager-submit'));
    expect(onWager).toHaveBeenCalledWith(400);
  });

  it('submits 1 when the field is not a number', () => {
    const onWager = vi.fn();
    render(<WagerInput bank={1000} onWager={onWager} />);
    fireEvent.change(screen.getByTestId('wager-input'), { target: { value: '' } });
    fireEvent.click(screen.getByTestId('wager-submit'));
    expect(onWager).toHaveBeenCalledWith(1);
  });
});
