/**
 * The deterministic plan for a given day's puzzles. Every generative game type
 * gets ONE fresh topic/parameters, chosen by rotating a curated pool by the
 * day-number — so content varies day to day but is reproducible (a re-run for
 * the same date picks the same topics, which keeps ingestion idempotent). Pure:
 * no clock, no randomness — the caller passes the date. Unit-tested in full.
 *
 * MAP + CLICKABLE are template-backed (the world map doesn't change), so they're
 * not part of the daily generation plan — they keep their seeded puzzle.
 *
 * The curated pools live in ../fixtures/topicPools (DATA); re-exported here so
 * callers keep a single import.
 */
import { QUIZ_TOPICS, ACROSTIC_WORDS, QUIZZLE_TOPICS } from '../fixtures/topicPools';

export { QUIZ_TOPICS, ACROSTIC_WORDS, QUIZZLE_TOPICS };

/** Whole days since the Unix epoch for a YYYY-MM-DD stamp (the rotation index). */
export function dayNumber(dateStamp: string): number {
  const ms = Date.parse(`${dateStamp}T00:00:00Z`);
  return Number.isNaN(ms) ? 0 : Math.floor(ms / 86_400_000);
}

/** Pick the day's entry from a pool by rotating with the day-number. */
export function rotate<T>(pool: readonly T[], day: number): T {
  return pool[((day % pool.length) + pool.length) % pool.length];
}

/** The topic for the Nth daily quiz type on `date`. Offsetting by the type index
 * gives each of the day's quizzes a DIFFERENT subject (World Capitals as Classic,
 * Shakespeare Plays as Multiple Choice, …) instead of five quizzes on one topic —
 * still deterministic per (date, index) so re-runs stay idempotent. Skips by 3 so
 * consecutive types don't land on adjacent, related pool entries. */
export function quizTopicFor(date: string, index: number): string {
  return rotate(QUIZ_TOPICS, dayNumber(date) + index * 3);
}

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
const LADDER_LENGTHS = [3, 4, 5] as const;

export interface DailyPlan {
  date: string;
  quizTopic: string;
  acrosticWord: string;
  quizzleTopic: string;
  ladderLength: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

/** The full plan for `date`. Different pools rotate at different rates so the
 * combination rarely repeats. */
export function planFor(date: string): DailyPlan {
  const d = dayNumber(date);
  return {
    date,
    quizTopic: rotate(QUIZ_TOPICS, d),
    acrosticWord: rotate(ACROSTIC_WORDS, d),
    quizzleTopic: rotate(QUIZZLE_TOPICS, d),
    ladderLength: rotate(LADDER_LENGTHS, d),
    difficulty: rotate(DIFFICULTIES, d),
  };
}
