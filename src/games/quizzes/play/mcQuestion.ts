/**
 * Pure helpers for the MULTIPLE_CHOICE renderer. A quiz answer carries its
 * question (promptValue) and a JSON string[] of `options`; the correct choice is
 * the answer's `display`. The renderer walks answers one at a time, showing the
 * first not-yet-found question, so these helpers stay React-free and testable.
 */
import type { AnswerRecord } from '../../../lib/dataClient';

/** Parse an answer's `options` JSON string[] defensively (bad/missing → []). */
export function parseOptions(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((o): o is string => typeof o === 'string') : [];
  } catch {
    return [];
  }
}

/** The current question = the first answer whose id isn't yet in `found`. */
export function currentQuestion(
  answers: AnswerRecord[],
  found: ReadonlySet<string>,
): AnswerRecord | null {
  return answers.find((a) => !found.has(a.id)) ?? null;
}

/** Whether a clicked option is the correct one for this answer (its display). */
export function isCorrectOption(answer: AnswerRecord, option: string): boolean {
  return option === answer.display;
}
