import { useCallback, useEffect, useState } from 'react';
import type { AnswerRecord } from '../../../lib/dataClient';
import { isCorrectOption } from './mcQuestion';

/** Pick-state for one MULTIPLE_CHOICE question: records the chosen option so the
 * renderer can flash it correct/wrong, then reports the attempt to the engine.
 * A correct pick advances (found grows → next question); a wrong pick shows red
 * and lets the player try again. Resets when the question changes. */
export function useMcPick(question: AnswerRecord | null, attempt: (id: string | null) => boolean) {
  const [picked, setPicked] = useState<string | null>(null);

  const choose = useCallback(
    (option: string) => {
      if (!question || picked) return;
      setPicked(option);
      if (isCorrectOption(question, option)) {
        attempt(question.id); // scores + advances; the question changes → effect resets
      }
    },
    [question, picked, attempt],
  );

  // Reset the pick when we move to a new question (id changes).
  useEffect(() => {
    setPicked(null);
  }, [question?.id]);

  /** Feedback class for an option: correct (green), wrong (red picked), or ''. */
  const optionState = useCallback(
    (option: string): 'correct' | 'wrong' | '' => {
      if (!picked || !question) return '';
      if (isCorrectOption(question, option)) return 'correct';
      return option === picked ? 'wrong' : '';
    },
    [picked, question],
  );

  return { picked, choose, optionState };
}
