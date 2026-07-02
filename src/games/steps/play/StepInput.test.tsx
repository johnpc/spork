import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StepInput } from './StepInput';

describe('StepInput', () => {
  it('submits and clears on a valid step', () => {
    const onSubmit = vi.fn().mockReturnValue(true);
    render(<StepInput onSubmit={onSubmit} />);
    const box = screen.getByTestId('step-input') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'cot' } });
    fireEvent.submit(box.closest('form') as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledWith('cot');
    expect(box.value).toBe('');
  });

  it('keeps the text on an invalid step', () => {
    render(<StepInput onSubmit={() => false} />);
    const box = screen.getByTestId('step-input') as HTMLInputElement;
    fireEvent.change(box, { target: { value: 'zzz' } });
    fireEvent.submit(box.closest('form') as HTMLFormElement);
    expect(box.value).toBe('zzz');
  });

  it('ignores empty submissions', () => {
    const onSubmit = vi.fn();
    render(<StepInput onSubmit={onSubmit} />);
    const box = screen.getByTestId('step-input') as HTMLInputElement;
    fireEvent.submit(box.closest('form') as HTMLFormElement);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
