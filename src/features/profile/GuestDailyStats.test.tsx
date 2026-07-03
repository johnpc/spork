import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GuestDailyStats } from './GuestDailyStats';

function stamp(offsetDays = 0): string {
  const t = new Date(Date.now() - offsetDays * 86_400_000);
  const p = (n: number) => `${n}`.padStart(2, '0');
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

describe('GuestDailyStats', () => {
  it('renders nothing when the guest has no activity', () => {
    const { container } = render(<GuestDailyStats />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows today's tally and streak once a game is finished", () => {
    window.localStorage.setItem(
      `spork.daily.quizzes:MAP.${stamp(0)}`,
      JSON.stringify({ score: 5, total: 6 }),
    );
    render(<GuestDailyStats />);
    expect(screen.getByTestId('guest-stats-done')).toHaveTextContent('1');
    expect(screen.getByTestId('guest-stats-streak')).toHaveTextContent('1-day streak');
  });

  it('shows a live streak without a completed game today (played yesterday)', () => {
    window.localStorage.setItem(
      `spork.daily.steps.${stamp(1)}`,
      JSON.stringify({ score: 1, total: 1 }),
    );
    render(<GuestDailyStats />);
    // 0 done today but the streak (from yesterday) keeps the card visible.
    expect(screen.getByTestId('guest-stats-done')).toHaveTextContent('0');
    expect(screen.getByTestId('guest-stats-streak')).toHaveTextContent('1-day streak');
  });
});
