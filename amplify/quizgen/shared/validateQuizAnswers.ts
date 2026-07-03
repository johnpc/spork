/**
 * Pure validator for a generated quiz's answers — the quiz analogue of
 * validateLadder/validateQuizzle. The LLM is never trusted: a too-thin or
 * malformed set (one lonely answer, a multiple-choice item with no distractors,
 * a "sort" with one bucket, duplicate/blank entries) would ship as a trivial or
 * broken daily puzzle. This enforces a real quiz per mode so the retry loop
 * regenerates instead of publishing junk. Pure → unit-tested without AWS.
 */
import type { GenMode } from './answersPrompt';
import type { ParsedAnswer } from './parseAnswers';

/** A playable quiz needs enough answers to be a game, not a coin-flip. */
const MIN_ANSWERS = 4;

export interface QuizValidation {
  ok: boolean;
  reason?: string;
}

export function validateQuizAnswers(mode: GenMode, answers: ParsedAnswer[]): QuizValidation {
  if (answers.length < MIN_ANSWERS) return { ok: false, reason: `too few (${answers.length})` };

  const displays = answers.map((a) => a.display?.trim().toLowerCase() ?? '');
  if (displays.some((d) => d === '')) return { ok: false, reason: 'blank display' };
  if (new Set(displays).size !== displays.length) return { ok: false, reason: 'duplicate answers' };

  if (mode === 'MULTIPLE_CHOICE') {
    for (const a of answers) {
      const opts = a.options ?? [];
      if (opts.length < 2) return { ok: false, reason: 'a question has <2 options' };
      if (!opts.includes(a.display)) return { ok: false, reason: 'answer not among its options' };
    }
  }

  if (mode === 'SORTABLE') {
    const buckets = new Set(answers.map((a) => a.bucket).filter((b): b is string => !!b));
    if (buckets.size < 2) return { ok: false, reason: `needs ≥2 buckets (got ${buckets.size})` };
  }

  return { ok: true };
}
