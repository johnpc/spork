import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hook = vi.hoisted(() => ({ value: {} as { stat: unknown; isLoading: boolean } }));
vi.mock('./useStat', () => ({ useStat: () => hook.value }));

import { StreakCard } from './StreakCard';

describe('StreakCard', () => {
  beforeEach(() => {
    hook.value = { stat: null, isLoading: false };
  });

  it('renders nothing while loading', () => {
    hook.value = { stat: null, isLoading: true };
    const { container } = render(<StreakCard />);
    expect(container.firstChild).toBeNull();
  });

  it('shows a zero-state prompt before the first session', () => {
    render(<StreakCard />);
    expect(screen.getByTestId('streak-current')).toHaveTextContent('0');
    expect(screen.getByText(/start a streak/i)).toBeInTheDocument();
  });

  it('shows the current streak, best, and total when studied', () => {
    hook.value = {
      stat: { currentStreak: 5, longestStreak: 9, totalReviews: 120 },
      isLoading: false,
    };
    render(<StreakCard />);
    expect(screen.getByTestId('streak-current')).toHaveTextContent('5');
    expect(screen.getByText(/Best: 9 · 120 cards reviewed/)).toBeInTheDocument();
  });
});
