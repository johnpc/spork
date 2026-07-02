/**
 * Pure Quizzle wager engine. Shares NOTHING with the Quizzes found-set engine —
 * a Quizzle is a bank you bet against, one question at a time. A guess is
 * correct iff it normalizes to (or is within typo tolerance of) the answer or
 * any accepted spelling; a correct wager ADDS to the bank, a wrong one SUBTRACTS.
 * All pure + deterministic, so it's unit-tested without React or AWS.
 */
import { fuzzyMatch } from './fuzzy';

/** Case/accent/punctuation-insensitive match key (Sporcle-style leniency). */
export function normalizeGuess(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining accents
    .replace(/[^a-z0-9 ]/g, '') // drop punctuation/symbols
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
}

export interface QuizzleQuestion {
  question: string;
  answer: string;
  accepted?: string[];
}

/** Does `guess` match the question's answer or any accepted spelling — exactly
 * or within typo tolerance (so "millenium falcon" matches "Millennium Falcon")? */
export function isCorrect(guess: string, q: QuizzleQuestion): boolean {
  const key = normalizeGuess(guess);
  if (!key) return false;
  const targets = [q.answer, ...(q.accepted ?? [])].map(normalizeGuess).filter(Boolean);
  return targets.some((t) => t === key || fuzzyMatch(key, t));
}

/** Clamp a wager into the legal range [1, bank] (bank must be >= 1). */
export function clampWager(wager: number, bank: number): number {
  const max = Math.max(1, Math.floor(bank));
  const w = Math.floor(Number.isFinite(wager) ? wager : 1);
  return Math.min(max, Math.max(1, w));
}

/** Apply a (clamped) wager to the bank: add when correct, subtract when wrong.
 * Bank never drops below 0. */
export function applyWager(bank: number, wager: number, correct: boolean): number {
  const staked = clampWager(wager, bank);
  return correct ? bank + staked : Math.max(0, bank - staked);
}
