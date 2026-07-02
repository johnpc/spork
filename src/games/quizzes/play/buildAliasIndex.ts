/**
 * Build the alias→answerId lookup for a quiz. Each answer carries a JSON array
 * of accepted spellings (raw); we normalize every spelling and map it to the
 * answer's id. O(1) matching at play time is just `index.get(normalize(guess))`.
 * Pure + deterministic. Later spellings never clobber an earlier answer's key
 * (first answer wins a shared alias), keeping matches stable.
 */
import { normalize } from './normalize';
import type { AnswerRecord } from '../../../lib/dataClient';

/** Parse an answer's `accepted` JSON string into a spelling array (tolerant). */
export function parseAccepted(accepted: string | null | undefined): string[] {
  if (!accepted) return [];
  try {
    const parsed: unknown = JSON.parse(accepted);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

/** Map every normalized accepted spelling to its answer id. */
export function buildAliasIndex(answers: AnswerRecord[]): Map<string, string> {
  const index = new Map<string, string>();
  for (const answer of answers) {
    for (const spelling of parseAccepted(answer.accepted)) {
      const key = normalize(spelling);
      if (key && !index.has(key)) index.set(key, answer.id);
    }
  }
  return index;
}
