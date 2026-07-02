import type { AnswerRecord } from '../../../lib/dataClient';

/**
 * Pure helpers for the SORTABLE renderer. The bucket list is DERIVED from the
 * distinct `answer.bucket` values (in first-seen order, so seeding controls the
 * column order) — never hardcoded. Items still waiting to be sorted are those
 * whose id is not yet in the engine's found set. Keeping this pure keeps the
 * renderer a thin view and lets the derivation be unit-tested in isolation.
 */

/** Distinct bucket labels, in first-seen order; blank/missing buckets ignored. */
export function bucketsOf(answers: AnswerRecord[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of answers) {
    const b = a.bucket?.trim();
    if (b && !seen.has(b)) {
      seen.add(b);
      out.push(b);
    }
  }
  return out;
}

/** Items the player has not yet correctly sorted (id absent from found). */
export function unsortedItems(answers: AnswerRecord[], found: ReadonlySet<string>): AnswerRecord[] {
  return answers.filter((a) => !found.has(a.id));
}

/** Correctly-sorted items now sitting in a given bucket (found + bucket match).
 * With `reveal`, includes still-unsorted items too (to show answers on give-up). */
export function itemsInBucket(
  answers: AnswerRecord[],
  found: ReadonlySet<string>,
  bucket: string,
  reveal = false,
): AnswerRecord[] {
  return answers.filter((a) => a.bucket?.trim() === bucket && (reveal || found.has(a.id)));
}
