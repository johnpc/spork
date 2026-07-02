import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStudyData, gradeCard } from './studyApi';
import { buildStudyQueue } from './buildStudyQueue';
import { buildChoices } from './buildChoices';
import { gradeForChoice } from './answerGrade';
import { useRecordOnDone } from './useRecordOnDone';
import { useAuth } from '../auth/useAuth';

/** Drives a multiple-choice study session: load cards + reviews, walk the
 * queue, present choices, and auto-grade each answer. */
export function useStudy(deckId: string | undefined) {
  const { status } = useAuth();
  const enabled = status === 'authenticated' && !!deckId;
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  // Running session tally (correct out of answered) for the end-of-session score.
  const [score, setScore] = useState({ correct: 0, total: 0 });
  // Which face is the prompt: 'front' (recall the back) or 'back' (recall front).
  const [direction, setDirection] = useState<'front' | 'back'>('front');

  const { data, isLoading } = useQuery({
    queryKey: ['study', deckId],
    queryFn: () => fetchStudyData(deckId as string),
    enabled,
  });

  const queue = useMemo(
    () => (data ? buildStudyQueue(data.cards, data.reviews, new Date()) : []),
    [data],
  );
  const current = queue[index] ?? null;
  const done = !isLoading && queue.length > 0 && index >= queue.length;

  // Choices are derived per card+direction; memoized so picking doesn't reshuffle.
  const choices = useMemo(
    () => (current && data ? buildChoices(current.card, data.cards, direction) : null),
    [current, data, direction],
  );

  // Answer with a chosen option: record the pick (for feedback) and grade once.
  const answer = useCallback(
    async (choice: string) => {
      if (!current || !deckId || !choices || picked) return;
      const correct = choice === choices.answer;
      setPicked(choice);
      setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
      await gradeCard(
        deckId,
        current.card.id,
        current.review,
        gradeForChoice(choice, choices.answer),
      );
    },
    [current, deckId, choices, picked],
  );

  const next = useCallback(() => {
    setPicked(null);
    setIndex((i) => i + 1);
  }, []);

  // Record the session (streak + totals) once when the queue is finished.
  useRecordOnDone(done, queue.length);

  const reset = useCallback(async () => {
    setIndex(0);
    setPicked(null);
    setScore({ correct: 0, total: 0 });
    await queryClient.invalidateQueries({ queryKey: ['study', deckId] });
  }, [queryClient, deckId]);

  const toggleDirection = useCallback(() => {
    setDirection((d) => (d === 'front' ? 'back' : 'front'));
    setIndex(0);
    setPicked(null);
    setScore({ correct: 0, total: 0 });
  }, []);

  return {
    isAuthenticated: status === 'authenticated',
    isLoading: enabled && isLoading,
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
    position: { index, total: queue.length },
  };
}
