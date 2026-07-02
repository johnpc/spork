import { describe, it, expect } from 'vitest';
import { nextRemaining, formatClock } from './tickTimer';

describe('nextRemaining', () => {
  it('subtracts whole elapsed seconds', () => {
    expect(nextRemaining(300, 5000)).toBe(295);
    expect(nextRemaining(300, 5999)).toBe(295); // partial second not yet counted
  });
  it('clamps at zero (never negative)', () => {
    expect(nextRemaining(10, 20000)).toBe(0);
  });
});

describe('formatClock', () => {
  it('formats m:ss with zero-padded seconds', () => {
    expect(formatClock(125)).toBe('2:05');
    expect(formatClock(60)).toBe('1:00');
    expect(formatClock(9)).toBe('0:09');
  });
  it('never shows negative time', () => {
    expect(formatClock(-5)).toBe('0:00');
  });
});
