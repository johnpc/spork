/**
 * Pure mapping from a multiple-choice pick to an SM-2 grade. Correct = a pass
 * (advances the interval); wrong = a lapse (resets, shows again soon). Kept
 * separate so the right/wrong→grade rule is unit-tested and the study hook stays
 * simple (and within the CRAP limit).
 */
export const GRADE_CORRECT = 4;
export const GRADE_WRONG = 1;

export function gradeForChoice(picked: string, correct: string): number {
  return picked === correct ? GRADE_CORRECT : GRADE_WRONG;
}
