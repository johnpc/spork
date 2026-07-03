import { describe, expect, it } from 'vitest';
import { formatCountdown, msUntilMidnight } from './nextPuzzle';

describe('msUntilMidnight', () => {
  it('counts the full day just after midnight', () => {
    const justAfter = new Date(2026, 6, 3, 0, 0, 1); // 00:00:01 local
    expect(msUntilMidnight(justAfter)).toBe(24 * 60 * 60 * 1000 - 1000);
  });
  it('counts a small remainder just before midnight', () => {
    const justBefore = new Date(2026, 6, 3, 23, 59, 30);
    expect(msUntilMidnight(justBefore)).toBe(30 * 1000);
  });
  it('is a full day exactly at midnight (next midnight, never zero)', () => {
    const midnight = new Date(2026, 6, 3, 0, 0, 0, 0);
    expect(msUntilMidnight(midnight)).toBe(24 * 60 * 60 * 1000);
  });
});

describe('formatCountdown', () => {
  it('formats hours and zero-padded minutes', () => {
    expect(formatCountdown(3 * 3600_000 + 7 * 60_000)).toBe('3h 07m');
  });
  it('rounds the minute up so it never shows 0m while time remains', () => {
    expect(formatCountdown(30_000)).toBe('0h 01m');
  });
  it('clamps a non-positive duration to 0h 00m', () => {
    expect(formatCountdown(0)).toBe('0h 00m');
    expect(formatCountdown(-5)).toBe('0h 00m');
  });
});
