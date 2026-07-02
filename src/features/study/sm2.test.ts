import { describe, it, expect } from 'vitest';
import { sm2, nextEase, nextInterval, clampGrade, type Sm2State } from './sm2';

const NOW = new Date('2026-06-01T00:00:00.000Z');
const fresh: Sm2State = { easeFactor: 2.5, intervalDays: 0, repetitions: 0 };

/** Days between an ISO dueAt and NOW. */
const daysFromNow = (iso: string) =>
  Math.round((new Date(iso).getTime() - NOW.getTime()) / (24 * 60 * 60 * 1000));

describe('clampGrade', () => {
  it('clamps below 0 and above 5 and rounds', () => {
    expect(clampGrade(-1)).toBe(0);
    expect(clampGrade(6)).toBe(5);
    expect(clampGrade(3.4)).toBe(3);
  });
});

describe('nextEase', () => {
  it('barely changes ease on a grade-3 pass', () => {
    expect(nextEase(2.5, 3)).toBeCloseTo(2.36, 2);
  });

  it('increases ease on a perfect grade-5', () => {
    expect(nextEase(2.5, 5)).toBeCloseTo(2.6, 2);
  });

  it('never drops below the 1.3 floor under repeated low grades', () => {
    let ef = 2.5;
    for (let i = 0; i < 10; i++) ef = nextEase(ef, 0);
    expect(ef).toBe(1.3);
  });
});

describe('nextInterval', () => {
  it('resets to 1 day on a lapse (grade < 3)', () => {
    expect(nextInterval({ ...fresh, repetitions: 5, intervalDays: 40 }, 2, 2.5)).toEqual({
      repetitions: 0,
      intervalDays: 1,
    });
  });

  it('follows the 1 -> 6 -> round(prev*ease) ladder on passes', () => {
    expect(nextInterval({ ...fresh, repetitions: 0 }, 4, 2.5).intervalDays).toBe(1);
    expect(nextInterval({ ...fresh, repetitions: 1 }, 4, 2.5).intervalDays).toBe(6);
    expect(nextInterval({ ...fresh, repetitions: 2, intervalDays: 6 }, 4, 2.5).intervalDays).toBe(
      15,
    );
  });
});

describe('sm2', () => {
  it('schedules a lapsed card 1 day out and resets repetitions', () => {
    const r = sm2({ easeFactor: 2.5, intervalDays: 40, repetitions: 5 }, 1, NOW);
    expect(r.repetitions).toBe(0);
    expect(r.intervalDays).toBe(1);
    expect(daysFromNow(r.dueAt)).toBe(1);
    expect(r.easeFactor).toBeCloseTo(1.96, 2); // ease still adjusts on a lapse
  });

  it('advances a new card through the first passes', () => {
    const first = sm2(fresh, 4, NOW);
    expect(first.repetitions).toBe(1);
    expect(daysFromNow(first.dueAt)).toBe(1);
    const second = sm2(first, 4, NOW);
    expect(daysFromNow(second.dueAt)).toBe(6);
  });

  it('is deterministic for a given injected now', () => {
    expect(sm2(fresh, 5, NOW).dueAt).toBe(sm2(fresh, 5, NOW).dueAt);
  });

  it('handles out-of-range grades without throwing (clamped)', () => {
    expect(() => sm2(fresh, 9, NOW)).not.toThrow();
    expect(sm2(fresh, -3, NOW).intervalDays).toBe(1); // clamped to a lapse
  });
});
