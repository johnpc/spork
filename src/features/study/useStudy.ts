import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { persistGrade } from './persistGrade';
import { useRecordOnDone } from './useRecordOnDone';
import { useStudyData } from './useStudyData';
import { useAuth } from '../auth/useAuth';

/** Drives a multiple-choice study session: load cards + reviews, walk the
 * queue, present choices, and auto-grade each answer. Guest-playable: a signed-in
 * player gets SM-2 (due cards + persisted grades); a guest studies the whole deck
 * once with no persistence — same card flow, score at the end for both. */
export function useStudy(deckId: string | undefined) {
  const { status } = useAuth();
  const signedIn = status === 'authenticated';
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 }); // end-of-session tally
  const [direction, setDirection] = useState<'front' | 'back'>('front'); // prompt face
  const [includeAll, setIncludeAll] = useState(false); // "Review all" round when nothing is due

  const { queue, current, done, canReviewAll, choices, isLoading, isError, retry } = useStudyData(
    deckId,
    signedIn,
    index,
    includeAll,
    direction,
  );

  // Record the pick + score it. Signed-in players also persist an SM-2 grade.
  const answer = useCallback(
    async (choice: string) => {
      if (!current || !deckId || !choices || picked) return;
      const correct = choice === choices.answer;
      setPicked(choice);
      setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
      // Signed-in players persist an SM-2 grade; guests just tally the score.
      await persistGrade(signedIn, deckId, current, choice, choices.answer);
    },
    [current, deckId, choices, picked, signedIn],
  );

  const next = useCallback(() => {
    setPicked(null);
    setIndex((i) => i + 1);
  }, []);

  // Record the streak once when finished — signed-in only (owner-scoped stat).
  useRecordOnDone(signedIn && done, queue.length);

  // Restart at card 0 with a fresh tally (shared by reset + toggle).
  const restart = useCallback(() => {
    setIndex(0);
    setPicked(null);
    setScore({ correct: 0, total: 0 });
  }, []);

  const reset = useCallback(async () => {
    restart();
    await queryClient.invalidateQueries({ queryKey: ['study', deckId] });
  }, [restart, queryClient, deckId]);

  const toggleDirection = useCallback(() => {
    setDirection((d) => (d === 'front' ? 'back' : 'front'));
    restart();
  }, [restart]);

  const reviewAll = useCallback(() => {
    setIncludeAll(true); // include not-yet-due cards, then restart at card 0
    restart();
  }, [restart]);
  return {
    isAuthenticated: signedIn,
    isLoading,
    isError,
    retry,
    current,
    choices,
    picked,
    answer,
    next,
    done,
    reset,
    score,
    direction,
    toggleDirection,
    canReviewAll,
    reviewAll,
    position: { index, total: queue.length },
  };
}
