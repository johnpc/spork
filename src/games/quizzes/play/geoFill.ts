/**
 * Pure view helpers for the map renderer. The engine's found set holds ANSWER
 * IDS (stable identity), not region ids — so the map must map each topology
 * region (a REGION-kind answer's promptValue = numeric ISO) to its answer id,
 * then color it found when that id is in the set. Keeping this pure lets
 * WorldMap.tsx stay a thin render and satisfies coverage without DOM tests.
 */
import type { AnswerRecord } from '../../../lib/dataClient';

/** region promptValue (numeric ISO string) → answer id, for REGION answers. */
export function regionAnswerMap(answers: AnswerRecord[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const a of answers) {
    if (a.promptKind === 'REGION' && a.promptValue) map.set(a.promptValue, a.id);
  }
  return map;
}

/** Role class for a topology region given the found set (answer ids) + the
 * region→answer map. A region with no mapped answer is inert (not in this quiz). */
export function regionClass(
  regionId: string | number | undefined,
  found: ReadonlySet<string>,
  regionToAnswer: ReadonlyMap<string, string>,
): string {
  const id = regionId == null ? '' : String(regionId);
  const answerId = regionToAnswer.get(id);
  if (!answerId) return 'sp-region sp-region--inert';
  return found.has(answerId) ? 'sp-region sp-region--found' : 'sp-region sp-region--blank';
}
