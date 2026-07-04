import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchQuizData } from './playApi';
import { buildAliasIndex } from './buildAliasIndex';
import { matchAnswer } from './matchAnswer';
import { useCountdown } from './useCountdown';
import { applyAttempt, type ScoringMode } from './scoringModes';
import { dailyRegionAnswers, dailyRegionLabel } from './dailyRegion';
import { parseRenderConfig } from './mapTopology';
import { useRecordBestScore } from './useRecordBestScore';

type Status = 'idle' | 'running' | 'done';

/** Mode-agnostic quiz play engine: load quiz + answers, run a countdown, track
 * the found set — delegating the scoring RULE to applyAttempt. Renderers answer
 * by typed guess (`submit`) or resolved id (`attempt`); first attempt auto-starts. */
export function usePlay(quizId: string | undefined) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['quiz-play', quizId],
    queryFn: () => fetchQuizData(quizId as string),
    enabled: !!quizId,
  });

  const quiz = data?.quiz ?? null;
  // Map games rotate through one continent per day (World on the weekly finale);
  // dailyRegionAnswers is a no-op for every non-map quiz. Region label surfaces
  // in the HUD ("· Africa").
  const allAnswers = useMemo(() => data?.answers ?? [], [data]);
  const answers = useMemo(() => dailyRegionAnswers(quiz?.mode, allAnswers, new Date()), [quiz?.mode, allAnswers]); // prettier-ignore
  const regionLabel = useMemo(() => dailyRegionLabel(quiz?.mode, new Date()), [quiz?.mode]);
  // Map view config (topology/projection) is stored as a JSON string on the quiz.
  const renderConfig = useMemo(() => parseRenderConfig(quiz?.renderConfig), [quiz?.renderConfig]);
  const total = answers.length;
  const limit = quiz?.timeLimitSeconds ?? 300;
  const scoring = (quiz?.scoringMode ?? 'MEMBERSHIP') as ScoringMode;
  const index = useMemo(() => buildAliasIndex(answers), [answers]);

  const [found, setFound] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>('idle');
  const done = status === 'done';
  const finish = useCallback(() => setStatus('done'), []);
  const { remaining, begin, beginIfIdle } = useCountdown(limit, status === 'running', finish);
  useRecordBestScore(done, quizId, found.size);

  const start = useCallback(() => {
    setFound(new Set());
    setStatus('running');
    begin();
  }, [begin]);

  /** Register a resolved attempt (by answer id, + optional bucket). Returns
   * whether it scored — drives renderer/input feedback. First interaction
   * auto-starts the clock (no dead "idle board"). */
  const attempt = useCallback(
    (answerId: string | null, bucket?: string): boolean => {
      if (status === 'done') return false;
      beginIfIdle();
      setStatus((s) => (s === 'idle' ? 'running' : s));
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
    isError,
    refetch,
    status,
    regionLabel,
    renderConfig,
    found,
    submit,
    attempt,
    start,
    giveUp: finish,
    remaining,
    timeSeconds: Math.max(0, limit - remaining), // freezes at done = final time
    score: { found: found.size, total },
  };
}
