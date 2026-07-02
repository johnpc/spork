/** Pure parser for an Acrostic's `clues` JSON field. Tolerant of malformed JSON —
 * degrade to empty rather than throw, so a bad row can't crash the play screen.
 * Keeps only entries with a non-empty clue AND answer. */
import type { Clue } from './acrosticEngine';

export function parseClues(json: string | null | undefined): Clue[] {
  if (!json) return [];
  try {
    const v: unknown = JSON.parse(json);
    if (!Array.isArray(v)) return [];
    return v.filter(isClue).map((c) => ({ clue: c.clue, answer: c.answer }));
  } catch {
    return [];
  }
}

function isClue(v: unknown): v is Clue {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.clue === 'string' &&
    r.clue.length > 0 &&
    typeof r.answer === 'string' &&
    r.answer.length > 0
  );
}
