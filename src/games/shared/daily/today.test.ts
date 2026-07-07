import { describe, it, expect } from 'vitest';
import { dayStamp, isValidDayStamp, isFuture, prevDay, nextDay } from './today';

describe('dayStamp', () => {
  it('formats local YYYY-MM-DD with zero-padding', () => {
    expect(dayStamp(new Date(2026, 6, 2))).toBe('2026-07-02'); // month is 0-based
    expect(dayStamp(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});

describe('isValidDayStamp', () => {
  it('accepts a real calendar date', () => {
    expect(isValidDayStamp('2026-07-02')).toBe(true);
  });
  it('rejects malformed or impossible dates', () => {
    expect(isValidDayStamp('2026-7-2')).toBe(false);
    expect(isValidDayStamp('2026-02-31')).toBe(false);
    expect(isValidDayStamp('nope')).toBe(false);
  });
});

describe('isFuture', () => {
  const now = new Date(2026, 6, 7); // 2026-07-07
  it('is true only for days after today', () => {
    expect(isFuture('2026-07-08', now)).toBe(true);
    expect(isFuture('2026-07-07', now)).toBe(false);
    expect(isFuture('2026-07-06', now)).toBe(false);
  });
});

describe('prevDay / nextDay', () => {
  it('steps across month + year boundaries', () => {
    expect(prevDay('2026-03-01')).toBe('2026-02-28');
    expect(nextDay('2026-12-31')).toBe('2027-01-01');
    expect(prevDay('2026-01-01')).toBe('2025-12-31');
  });
});
