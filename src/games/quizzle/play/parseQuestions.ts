/** Pure parser for a Quizzle's `questions` JSON field. Tolerant of malformed
 * JSON — degrade to empty rather than throw, so a bad row can't crash the play
 * screen. Keeps only well-formed { question, answer } entries. */
import type { QuizzleQuestion } from './quizzleEngine';

function toQuestion(v: unknown): QuizzleQuestion | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  if (typeof o.question !== 'string' || typeof o.answer !== 'string') return null;
  const accepted = Array.isArray(o.accepted)
    ? o.accepted.filter((s): s is string => typeof s === 'string')
    : undefined;
  return { question: o.question, answer: o.answer, accepted };
}

export function parseQuestions(json: string | null | undefined): QuizzleQuestion[] {
  if (!json) return [];
  try {
    const v: unknown = JSON.parse(json);
    if (!Array.isArray(v)) return [];
    return v.map(toQuestion).filter((q): q is QuizzleQuestion => q !== null);
  } catch {
    return [];
  }
}
