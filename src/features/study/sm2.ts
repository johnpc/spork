/**
 * Canonical SM-2 spaced-repetition algorithm (SuperMemo 2 / Anki-style).
 *
 * Pure + deterministic: `now` is injected so the next due date is testable and
 * never reads the clock. Split into `nextEase` + `nextInterval` so each piece is
 * trivially covered and CRAP stays low.
 *
 * Grade scale 0–5 (self-graded): <3 is a lapse (failed recall), >=3 is a pass.
 */
export interface Sm2State {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface Sm2Result extends Sm2State {
  dueAt: string;
}

const MIN_EASE = 1.3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Clamp a self-grade into the valid 0–5 SM-2 band. */
export function clampGrade(grade: number): number {
  if (grade < 0) return 0;
  if (grade > 5) return 5;
  return Math.round(grade);
}

/** Updated ease factor for a grade (floored at 1.3). Applies for any grade. */
export function nextEase(easeFactor: number, grade: number): number {
  const g = clampGrade(grade);
  const updated = easeFactor + (0.1 - (5 - g) * (0.08 + (5 - g) * 0.02));
  return Math.max(MIN_EASE, updated);
}

/** Next repetitions + interval (days). A lapse (<3) resets to a 1-day interval. */
export function nextInterval(
  state: Sm2State,
  grade: number,
  ease: number,
): { repetitions: number; intervalDays: number } {
  if (clampGrade(grade) < 3) return { repetitions: 0, intervalDays: 1 };
  const repetitions = state.repetitions + 1;
  if (repetitions === 1) return { repetitions, intervalDays: 1 };
  if (repetitions === 2) return { repetitions, intervalDays: 6 };
  return { repetitions, intervalDays: Math.round(state.intervalDays * ease) };
}

/** Advance SM-2 state by one self-graded review. */
export function sm2(state: Sm2State, grade: number, now: Date): Sm2Result {
  const easeFactor = nextEase(state.easeFactor, grade);
  const { repetitions, intervalDays } = nextInterval(state, grade, easeFactor);
  const dueAt = new Date(now.getTime() + intervalDays * MS_PER_DAY).toISOString();
  return { easeFactor, intervalDays, repetitions, dueAt };
}
