import { describe, it, expect } from 'vitest';
import { computeMastery, MASTERY_REPS } from './mastery';

describe('computeMastery', () => {
  it('counts cards at or above the mastery rep threshold', () => {
    const reviews = [
      { repetitions: 3 },
      { repetitions: 5 },
      { repetitions: 1 },
      { repetitions: 0 },
    ];
    const m = computeMastery(reviews, 10);
    expect(m.mastered).toBe(2);
    expect(m.total).toBe(10);
    expect(m.percent).toBe(20);
  });

  it('is 0% for a deck with no reviews', () => {
    expect(computeMastery([], 5)).toEqual({ mastered: 0, total: 5, percent: 0 });
  });

  it('treats missing repetitions as 0', () => {
    expect(computeMastery([{ repetitions: null }, {}], 4).mastered).toBe(0);
  });

  it('never reports more mastered than the deck size', () => {
    const reviews = Array.from({ length: 8 }, () => ({ repetitions: 5 }));
    const m = computeMastery(reviews, 3); // stale extra reviews vs a 3-card deck
    expect(m.mastered).toBe(3);
    expect(m.percent).toBe(100);
  });

  it('handles an empty (0-card) deck without dividing by zero', () => {
    expect(computeMastery([], 0)).toEqual({ mastered: 0, total: 0, percent: 0 });
  });

  it('uses a sensible mastery threshold', () => {
    expect(MASTERY_REPS).toBeGreaterThanOrEqual(2);
  });
});
