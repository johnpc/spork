import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStudyData } from './studyApi';
import { buildStudyQueue } from './buildStudyQueue';
import { buildChoices } from './buildChoices';
import { persistGrade } from './persistGrade';
import { useRecordOnDone } from './useRecordOnDone';
import { useAuth } from '../auth/useAuth';

/** Drives a multiple-choice study session: load cards + reviews, walk the
 * queue, present choices, and auto-grade each answer. Guest-playable: a signed-in
 * player gets SM-2 (due cards + persisted grades); a guest studies the whole deck
 * once with no persistence — same card flow, score at the end for both. */
export function useStudy(deckId: string | undefined) {
  const { status } = useAuth();
  const signedIn = status === 'authenticated';
  const enabled = !!deckId;
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 }); // end-of-session tally
  const [direction, setDirection] = useState<'front' | 'back'>('front'); // prompt face

  const { data, isLoading } = useQuery({
    queryKey: ['study', deckId, signedIn],
    queryFn: () => fetchStudyData(deckId as string, signedIn),
    enabled,
  });

  const queue = useMemo(() => (data ? buildStudyQueue(data.cards, data.reviews, new Date()) : []), [data]); // prettier-ignore
  const current = queue[index] ?? null;
  const done = !isLoading && queue.length > 0 && index >= queue.length;

  // Choices are derived per card+direction; memoized so picking doesn't reshuffle.
  const choices = useMemo(() => (current && data ? buildChoices(current.card, data.cards, direction) : null), [current, data, direction]); // prettier-ignore

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

  return {
    isAuthenticated: signedIn,
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
