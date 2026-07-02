import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  generateQuiz,
  fetchQuizRuns,
  fetchDraftQuizzes,
  publishQuiz,
  type GenerateQuizInput,
} from './quizGenApi';

/** Quiz admin dashboard: start generation, poll runs while any is RUNNING, list
 * DRAFT quizzes, and publish. Polling flips to DRAFT_READY without a refresh;
 * finishing a run refreshes the draft list. */
export function useQuizAdmin() {
  const qc = useQueryClient();

  const runs = useQuery({
    queryKey: ['quiz-runs'],
    queryFn: fetchQuizRuns,
    refetchInterval: (query) =>
      (query.state.data ?? []).some((r) => r.status === 'RUNNING') ? 4000 : false,
  });

  const drafts = useQuery({ queryKey: ['quiz-drafts'], queryFn: fetchDraftQuizzes });

  const start = useMutation({
    mutationFn: (input: GenerateQuizInput) => generateQuiz(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['quiz-runs'] });
    },
  });

  const publish = useMutation({
    mutationFn: (quizId: string) => publishQuiz(quizId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['quiz-drafts'] });
      await qc.invalidateQueries({ queryKey: ['quizzes'] }); // the public list
    },
  });

  // When the running count drops (a run just finished), a new DRAFT may exist —
  // refresh the draft list. Effect + ref guard, mirroring flashstack's pattern.
  const runningCount = (runs.data ?? []).filter((r) => r.status === 'RUNNING').length;
  const prevRunning = useRef(runningCount);
  useEffect(() => {
    if (runningCount < prevRunning.current) {
      void qc.invalidateQueries({ queryKey: ['quiz-drafts'] });
    }
    prevRunning.current = runningCount;
  }, [runningCount, qc]);

  return {
    runs: runs.data ?? [],
    drafts: drafts.data ?? [],
    isLoading: runs.isLoading,
    generate: start.mutateAsync,
    isGenerating: start.isPending,
    publish: publish.mutateAsync,
    publishingId: publish.isPending ? publish.variables : null,
  };
}
