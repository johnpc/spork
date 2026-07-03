import { describe, it, expect } from 'vitest';
import { dayNumber, rotate, planFor, QUIZ_TOPICS } from './dailyPlan';

describe('dayNumber', () => {
  it('counts whole UTC days since the epoch', () => {
    expect(dayNumber('1970-01-01')).toBe(0);
    expect(dayNumber('1970-01-02')).toBe(1);
    expect(dayNumber('2026-07-02')).toBe(20636);
  });
  it('is 0 for a malformed stamp', () => {
    expect(dayNumber('not-a-date')).toBe(0);
  });
});

describe('rotate', () => {
  it('cycles the pool by the day number', () => {
    const pool = ['a', 'b', 'c'];
    expect(rotate(pool, 0)).toBe('a');
    expect(rotate(pool, 1)).toBe('b');
    expect(rotate(pool, 3)).toBe('a');
    expect(rotate(pool, -1)).toBe('c'); // negative-safe
  });
});

describe('planFor', () => {
  it('is deterministic for a date (idempotent re-runs) and picks real pool items', () => {
    const a = planFor('2026-07-02');
    const b = planFor('2026-07-02');
    expect(a).toEqual(b);
    expect(a.date).toBe('2026-07-02');
    expect(QUIZ_TOPICS).toContain(a.quizTopic);
    expect(['EASY', 'MEDIUM', 'HARD']).toContain(a.difficulty);
    expect([3, 4, 5]).toContain(a.ladderLength);
  });
  it('varies day to day', () => {
    expect(planFor('2026-07-02').quizTopic).not.toBe(planFor('2026-07-03').quizTopic);
  });
});
