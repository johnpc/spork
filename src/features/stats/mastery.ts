/**
 * Pure mastery calc, derived live from a deck's review rows (no stored state, so
 * it's always accurate). A card counts as "mastered" once it's been recalled
 * correctly enough times — repetitions >= MASTERY_REPS. Mastery is out of the
 * deck's total card count, so unreviewed cards correctly drag it down.
 */
export const MASTERY_REPS = 3;

export interface MasteryInput {
  repetitions?: number | null;
}

export interface Mastery {
  mastered: number;
  total: number;
  percent: number;
}

export function computeMastery(reviews: MasteryInput[], cardCount: number): Mastery {
  const total = Math.max(0, cardCount);
  const mastered = reviews.filter((r) => (r.repetitions ?? 0) >= MASTERY_REPS).length;
  const capped = Math.min(mastered, total); // never exceed the deck size
  return { mastered: capped, total, percent: total === 0 ? 0 : Math.round((capped / total) * 100) };
}
