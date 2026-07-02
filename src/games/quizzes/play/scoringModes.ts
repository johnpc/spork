/**
 * Pure scoring engines — the third axis of the model (see CLAUDE.md). Given the
 * current session state and a resolved answer id, each mode decides how the
 * found set + run status change. Keeping this pure (no timer, no React) means
 * every scoring rule is unit-tested in isolation and usePlay just delegates.
 *
 * All modes share the found-set representation (a Set of answer ids) so renderers
 * stay uniform; they differ only in the RULE applied on each attempt:
 *   • membership  — any correct id counts; done when all found.
 *   • sequence    — ids must be found in orderIndex order; a correct id that is
 *                   the NEXT expected one counts, otherwise it's a miss.
 *   • bucketing   — like membership, but the attempt carries a chosen bucket and
 *                   only counts when it matches the answer's correct bucket.
 *   • elimination — membership, but the FIRST miss ends the run (minefield).
 */
import type { AnswerRecord } from '../../../lib/dataClient';

export type ScoringMode = 'MEMBERSHIP' | 'SEQUENCE' | 'BUCKETING' | 'ELIMINATION';

export interface PlayState {
  found: ReadonlySet<string>;
  status: 'running' | 'done';
}

export interface Attempt {
  answerId: string | null; // resolved answer id (null = no match at all)
  bucket?: string; // BUCKETING: the bucket the player dropped the item into
}

export interface ScoreResult {
  found: Set<string>;
  status: 'running' | 'done';
  hit: boolean; // did this attempt score? (drives input flash)
}

const asById = (answers: AnswerRecord[]) => new Map(answers.map((a) => [a.id, a]));

/** Apply one attempt under the given scoring mode. Pure. */
export function applyAttempt(
  mode: ScoringMode,
  state: PlayState,
  attempt: Attempt,
  answers: AnswerRecord[],
): ScoreResult {
  const total = answers.length;
  const miss = (): ScoreResult => ({
    found: new Set(state.found),
    status: mode === 'ELIMINATION' ? 'done' : state.status,
    hit: false,
  });

  const { answerId } = attempt;
  if (!answerId || state.found.has(answerId)) {
    // Unknown/duplicate: a no-op for most modes, but a fatal miss for minefield
    // only when it was a genuine wrong guess (unknown id), not a duplicate.
    return answerId && state.found.has(answerId) ? { ...miss(), status: state.status } : miss();
  }

  if (mode === 'SEQUENCE') {
    const byId = asById(answers);
    const nextIdx = state.found.size; // ids must arrive in orderIndex 0,1,2,…
    if ((byId.get(answerId)?.orderIndex ?? -1) !== nextIdx) return miss();
  }
  if (mode === 'BUCKETING') {
    const byId = asById(answers);
    if (attempt.bucket !== undefined && byId.get(answerId)?.bucket !== attempt.bucket)
      return miss();
  }

  const found = new Set(state.found);
  found.add(answerId);
  return { found, status: found.size >= total && total > 0 ? 'done' : state.status, hit: true };
}
