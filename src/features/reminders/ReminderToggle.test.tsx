import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const rem = vi.hoisted(() => ({ value: {} as ReturnType<typeof base> }));
const base = () => ({ enabled: false, denied: false, busy: false, toggle: vi.fn() });
vi.mock('../mydecks/useDueSummary', () => ({ useDueSummary: () => ({ summary: { total: 3 } }) }));
vi.mock('./useReminders', () => ({ useReminders: () => rem.value }));

import { ReminderToggle } from './ReminderToggle';

describe('ReminderToggle', () => {
  beforeEach(() => {
    rem.value = base();
  });

  it('reflects off state and toggles on click', () => {
    render(<ReminderToggle />);
    const sw = screen.getByTestId('reminder-switch');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(sw);
    expect(rem.value.toggle).toHaveBeenCalled();
  });

  it('reflects on state', () => {
    rem.value = { ...base(), enabled: true };
    render(<ReminderToggle />);
    expect(screen.getByTestId('reminder-switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('shows a blocked hint when permission was denied', () => {
    rem.value = { ...base(), denied: true };
    render(<ReminderToggle />);
    expect(screen.getByText(/blocked/i)).toBeInTheDocument();
  });
});
