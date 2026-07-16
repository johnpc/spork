import { describe, it, expect } from 'vitest';
import { isDailyPuzzle } from './isDailyPuzzle';

describe('isDailyPuzzle', () => {
  it('is true for a daily-generated id (daily-<game>-<date>)', () => {
    expect(isDailyPuzzle('daily-steps-2026-07-15')).toBe(true);
    expect(isDailyPuzzle('daily-classic-2026-01-01')).toBe(true);
  });

  it('is false for an evergreen (static seed / authored) id', () => {
    expect(isDailyPuzzle('17f9be95-3f41-4855-8bd8-36893774abca')).toBe(false);
    expect(isDailyPuzzle('cat-dog-easy')).toBe(false);
  });

  it('is false for a null/undefined/empty id', () => {
    expect(isDailyPuzzle(null)).toBe(false);
    expect(isDailyPuzzle(undefined)).toBe(false);
    expect(isDailyPuzzle('')).toBe(false);
  });

  it('does not match an id that merely contains "daily" mid-string', () => {
    expect(isDailyPuzzle('my-daily-routine')).toBe(false);
  });
});
