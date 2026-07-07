import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DateSwitcher } from './DateSwitcher';

const NOW = new Date(2026, 6, 7); // 2026-07-07

describe('DateSwitcher', () => {
  it('labels today as "Today" and disables the forward arrow', () => {
    render(<DateSwitcher date="2026-07-07" onChange={vi.fn()} now={NOW} />);
    expect(screen.getByTestId('date-label')).toHaveTextContent('Today');
    expect(screen.getByTestId('date-next')).toBeDisabled();
  });

  it('steps back a day on prev', () => {
    const onChange = vi.fn();
    render(<DateSwitcher date="2026-07-07" onChange={onChange} now={NOW} />);
    fireEvent.click(screen.getByTestId('date-prev'));
    expect(onChange).toHaveBeenCalledWith('2026-07-06');
  });

  it('shows a past date and allows stepping forward toward today', () => {
    const onChange = vi.fn();
    render(<DateSwitcher date="2026-07-05" onChange={onChange} now={NOW} />);
    expect(screen.getByTestId('date-label')).toHaveTextContent('2026-07-05');
    expect(screen.getByTestId('date-next')).not.toBeDisabled();
    fireEvent.click(screen.getByTestId('date-next'));
    expect(onChange).toHaveBeenCalledWith('2026-07-06');
  });
});
