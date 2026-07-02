import { describe, it, expect } from 'vitest';
import { dayStamp } from './today';

describe('dayStamp', () => {
  it('formats local YYYY-MM-DD with zero-padding', () => {
    expect(dayStamp(new Date(2026, 6, 2))).toBe('2026-07-02'); // month is 0-based
    expect(dayStamp(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});
