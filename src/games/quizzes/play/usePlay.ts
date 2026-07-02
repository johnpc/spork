import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchQuizData } from './playApi';
import { buildAliasIndex } from './buildAliasIndex';
import { matchAnswer } from './matchAnswer';
import { applyFound, isComplete } from './scoreState';
import { nextRemaining } from './tickTimer';
import { useRecordBestScore } from './useRecordBestScore';

type Status = 'idle' | 'running' | 'done';

/**
 * Mode-agnostic quiz play engine: load quiz + answers, run a countdown, match
 * typed guesses against the alias index, and track the found set. Renderers
 * (map/list/…) read `found` + `answers`; the input box + HUD are shared. No mode
 * logic lives here — that's the whole point of the engine/renderer split.
 */
export function usePlay(quizId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['quiz-play', quizId],
    queryFn: () => fetchQuizData(quizId as string),
    enabled: !!quizId,
  });

  const quiz = data?.quiz ?? null;
  const answers = useMemo(() => data?.answers ?? [], [data]);
  const total = answers.length;
  const limit = quiz?.timeLimitSeconds ?? 300;
  const index = useMemo(() => buildAliasIndex(answers), [answers]);

  const [found, setFound] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>('idle');
  const [remaining, setRemaining] = useState(limit);
  const startedAt = useRef<number | null>(null);

  const done = status === 'done';
  useRecordBestScore(done, quizId, found.size);

  const start = useCallback(() => {
    setFound(new Set());
    setStatus('running');
    setRemaining(limit);
    startedAt.current = Date.now();
  }, [limit]);

  /** End the session early (Sporcle "give up") — reveals the final score. */
  const giveUp = useCallback(() => setStatus('done'), []);

  // Countdown while running; flip to done when time expires.
  useEffect(() => {
    if (status !== 'running') return;
    const tick = () => {
      const left = nextRemaining(limit, Date.now() - (startedAt.current ?? Date.now()));
      setRemaining(left);
      if (left <= 0) setStatus('done');
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [status, limit]);

  /** Submit a guess; returns true on a fresh match (for input feedback). */
  const submit = useCallback(
    (guess: string): boolean => {
      if (status !== 'running') return false;
      const id = matchAnswer(guess, index);
      if (!id || found.has(id)) return false;
      const next = applyFound(found, id);
      setFound(next);
      if (isComplete(next.size, total)) setStatus('done');
      return true;
    },
    [status, index, found, total],
  );

  return {
    quiz,
    answers,
    isLoading: !!quizId && isLoading,
    status,
    found,
    submit,
    start,
    giveUp,
    remaining,
    score: { found: found.size, total },
  };
}
