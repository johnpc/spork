/**
 * Pure helper for MULTIPLE_CHOICE reveal. When the game ends (give-up/time-up),
 * we show ALL questions with their correct answer marked. Separates found vs.
 * missed so the player sees what they got right and what they missed — the same
 * reveal convention as CLASSIC's revealed slots.
 */
import type { AnswerRecord } from '../../../lib/dataClient';
import { parseOptions } from './mcQuestion';

export interface McRevealQuestion {
  id: string;
  promptValue: string;
  options: string[];
  correctAnswer: string;
  found: boolean;
}

/** Build reveal list: all questions, flagged found/missed. Order by id for stability. */
export function mcRevealQuestions(
  answers: AnswerRecord[],
  found: ReadonlySet<string>,
): McRevealQuestion[] {
  return [...answers]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((a) => ({
      id: a.id,
      promptValue: a.promptValue ?? a.display ?? '',
      options: parseOptions(a.options),
      correctAnswer: a.display ?? '',
      found: found.has(a.id),
    }));
}
