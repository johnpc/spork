import { describe, expect, it } from 'vitest';
import { currentStreak } from './dailyStreak';

const NOON = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12, 0, 0);

describe('currentStreak', () => {
  it('is 0 with no plays', () => {
    expect(currentStreak(new Set(), NOON(2026, 7, 3))).toBe(0);
  });

  it('counts a single day played today', () => {
    expect(currentStreak(new Set(['2026-07-03']), NOON(2026, 7, 3))).toBe(1);
  });

  it('counts consecutive days ending today', () => {
    const dates = new Set(['2026-07-01', '2026-07-02', '2026-07-03']);
    expect(currentStreak(dates, NOON(2026, 7, 3))).toBe(3);
  });

  it('stays alive when today is unplayed but yesterday was', () => {
    const dates = new Set(['2026-07-01', '2026-07-02']);
    expect(currentStreak(dates, NOON(2026, 7, 3))).toBe(2);
  });

  it('is dead when the last play was two days ago', () => {
    const dates = new Set(['2026-07-01']);
    expect(currentStreak(dates, NOON(2026, 7, 3))).toBe(0);
  });

  it('stops at the first gap, ignoring older isolated days', () => {
    const dates = new Set(['2026-06-20', '2026-07-02', '2026-07-03']);
    expect(currentStreak(dates, NOON(2026, 7, 3))).toBe(2);
  });

  it('handles a month boundary', () => {
    const dates = new Set(['2026-06-30', '2026-07-01']);
    expect(currentStreak(dates, NOON(2026, 7, 1))).toBe(2);
  });
});
