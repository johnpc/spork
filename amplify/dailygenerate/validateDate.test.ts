import { describe, it, expect } from 'vitest';
import { assertPastOrToday, utcStamp } from './validateDate';

const today = new Date('2026-07-07T12:00:00Z');

describe('assertPastOrToday', () => {
  it('accepts a valid past date and today', () => {
    expect(() => assertPastOrToday('2026-03-01', today)).not.toThrow();
    expect(() => assertPastOrToday('2026-07-07', today)).not.toThrow();
  });

  it('rejects a future date', () => {
    expect(() => assertPastOrToday('2026-07-08', today)).toThrow(/future/);
  });

  it('rejects a malformed stamp', () => {
    expect(() => assertPastOrToday('2026-7-1', today)).toThrow(/invalid/);
    expect(() => assertPastOrToday('nope', today)).toThrow(/invalid/);
  });

  it('rejects an impossible calendar date', () => {
    expect(() => assertPastOrToday('2026-02-31', today)).toThrow(/invalid/);
  });
});

describe('utcStamp', () => {
  it('formats a Date as UTC YYYY-MM-DD', () => {
    expect(utcStamp(new Date('2026-01-05T23:00:00Z'))).toBe('2026-01-05');
  });
});
