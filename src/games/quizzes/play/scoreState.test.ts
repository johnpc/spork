import { describe, it, expect } from 'vitest';
import { applyFound, scorePercent, isComplete } from './scoreState';

describe('applyFound', () => {
  it('adds an id without mutating the input set', () => {
    const before = new Set(['a']);
    const after = applyFound(before, 'b');
    expect([...after]).toEqual(['a', 'b']);
    expect([...before]).toEqual(['a']);
  });
  it('is idempotent', () => {
    expect([...applyFound(new Set(['a']), 'a')]).toEqual(['a']);
  });
});

describe('scorePercent', () => {
  it('rounds to a whole percent', () => {
    expect(scorePercent(1, 3)).toBe(33);
    expect(scorePercent(2, 3)).toBe(67);
  });
  it('is 0 when there are no answers', () => {
    expect(scorePercent(0, 0)).toBe(0);
  });
});

describe('isComplete', () => {
  it('is true only when all answers are found', () => {
    expect(isComplete(3, 3)).toBe(true);
    expect(isComplete(2, 3)).toBe(false);
    expect(isComplete(0, 0)).toBe(false);
  });
});
