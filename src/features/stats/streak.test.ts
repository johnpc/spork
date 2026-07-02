import { describe, it, expect } from 'vitest';
import { advanceStreak, daysBetween } from './streak';

describe('daysBetween', () => {
  it('counts calendar days between day stamps', () => {
    expect(daysBetween('2026-06-01', '2026-06-02')).toBe(1);
    expect(daysBetween('2026-06-01', '2026-06-01')).toBe(0);
    expect(daysBetween('2026-06-01', '2026-06-05')).toBe(4);
  });
});

describe('advanceStreak', () => {
  it('starts a streak at 1 on the first ever session', () => {
    expect(advanceStreak({ currentStreak: 0, longestStreak: 0 }, '2026-06-10')).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      lastStudiedDate: '2026-06-10',
    });
  });

  it('does not double-count a second session the same day', () => {
    const s = advanceStreak(
      { currentStreak: 3, longestStreak: 5, lastStudiedDate: '2026-06-10' },
      '2026-06-10',
    );
    expect(s.currentStreak).toBe(3);
  });

  it('increments on a consecutive day', () => {
    const s = advanceStreak(
      { currentStreak: 3, longestStreak: 5, lastStudiedDate: '2026-06-10' },
      '2026-06-11',
    );
    expect(s.currentStreak).toBe(4);
  });

  it('resets to 1 after a missed day', () => {
    const s = advanceStreak(
      { currentStreak: 9, longestStreak: 9, lastStudiedDate: '2026-06-10' },
      '2026-06-13',
    );
    expect(s.currentStreak).toBe(1);
    expect(s.longestStreak).toBe(9); // longest is preserved
  });

  it('grows longest when current passes it', () => {
    const s = advanceStreak(
      { currentStreak: 5, longestStreak: 5, lastStudiedDate: '2026-06-10' },
      '2026-06-11',
    );
    expect(s.longestStreak).toBe(6);
  });
});
