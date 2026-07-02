import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchQuizData } from './playApi';
import { buildAliasIndex } from './buildAliasIndex';
import { matchAnswer } from './matchAnswer';
import { nextRemaining } from './tickTimer';
import { applyAttempt, type ScoringMode } from './scoringModes';
import { useRecordBestScore } from './useRecordBestScore';

type Status = 'idle' | 'running' | 'done';

/** Mode-agnostic quiz play engine: load quiz + answers, run a countdown, track
 * the found set — delegating the scoring RULE to applyAttempt. Renderers answer
 * by typed guess (`submit`) or resolved id (`attempt`); first attempt auto-starts. */
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
  const scoring = (quiz?.scoringMode ?? 'MEMBERSHIP') as ScoringMode;
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

  /** Begin the clock without wiping progress (used to auto-start on first play). */
  const beginIfIdle = useCallback(() => {
    if (startedAt.current == null) startedAt.current = Date.now();
    setStatus((s) => (s === 'idle' ? 'running' : s));
  }, []);

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

  /** Register a resolved attempt (by answer id, + optional bucket). Returns
   * whether it scored — drives renderer/input feedback. */
  const attempt = useCallback(
    (answerId: string | null, bucket?: string): boolean => {
      if (status === 'done') return false;
      beginIfIdle(); // first interaction starts the clock — no dead "idle board"
      const r = applyAttempt(scoring, { found, status: 'running' }, { answerId, bucket }, answers);
      if (r.found.size !== found.size) setFound(r.found);
      if (r.status === 'done') setStatus('done');
      return r.hit;
    },
    [status, scoring, found, answers, beginIfIdle],
  );

  /** Typed-input convenience: resolve a guess to an id, then attempt it. */
  const submit = useCallback(
    (guess: string): boolean => attempt(matchAnswer(guess, index)),
    [attempt, index],
  );

  return {
    quiz,
    answers,
    isLoading: !!quizId && isLoading,
    status,
    found,
    submit,
    attempt,
    start,
    giveUp,
    remaining,
    timeSeconds: Math.max(0, limit - remaining), // freezes at done = final time
    score: { found: found.size, total },
  };
}
