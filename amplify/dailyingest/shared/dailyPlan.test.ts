import { describe, it, expect } from 'vitest';
import {
  dayNumber,
  rotate,
  planFor,
  quizTopicFor,
  QUIZ_TOPICS,
  ACROSTIC_WORDS,
  QUIZZLE_TOPICS,
} from './dailyPlan';

describe('topic pools', () => {
  it('have no duplicate entries (a dupe shortens the repeat cadence silently)', () => {
    for (const pool of [QUIZ_TOPICS, ACROSTIC_WORDS, QUIZZLE_TOPICS]) {
      expect(new Set(pool).size).toBe(pool.length);
    }
  });
  it('are large enough that a daily player rarely repeats within a month', () => {
    expect(QUIZ_TOPICS.length).toBeGreaterThanOrEqual(30);
    expect(ACROSTIC_WORDS.length).toBeGreaterThanOrEqual(21);
    expect(QUIZZLE_TOPICS.length).toBeGreaterThanOrEqual(14);
  });
  it('acrostic words are single all-caps words of a clue-able length', () => {
    for (const w of ACROSTIC_WORDS) expect(w).toMatch(/^[A-Z]{4,9}$/);
  });
});

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

describe('quizTopicFor', () => {
  it('gives each of the day’s five quiz types a DISTINCT topic', () => {
    const topics = [0, 1, 2, 3, 4].map((i) => quizTopicFor('2026-07-02', i));
    expect(new Set(topics).size).toBe(5); // no repeats across the day's quizzes
    for (const t of topics) expect(QUIZ_TOPICS).toContain(t);
  });
  it('is deterministic per (date, index) for idempotent re-runs', () => {
    expect(quizTopicFor('2026-07-02', 3)).toBe(quizTopicFor('2026-07-02', 3));
  });
  it('index 0 matches the plan’s base quizTopic', () => {
    expect(quizTopicFor('2026-07-02', 0)).toBe(planFor('2026-07-02').quizTopic);
  });
});
