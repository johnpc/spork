import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateDeck, fetchGenerationRuns, type GenerateDeckInput } from './generateApi';

/** Start-generation mutation + the recent-runs list (admin dashboard). While
 * any run is still RUNNING, poll every few seconds so the admin sees it flip to
 * DRAFT_READY (and the new deck appear) without a manual refresh. */
export function useGenerateDeck() {
  const qc = useQueryClient();
  const runs = useQuery({
    queryKey: ['generation-runs'],
    queryFn: fetchGenerationRuns,
    // v5: the callback receives the query; poll while any run is RUNNING.
    refetchInterval: (query) =>
      (query.state.data ?? []).some((r) => r.status === 'RUNNING') ? 4000 : false,
  });

  // When the running count drops (a run just finished), refresh the deck list
  // so the freshly-generated DRAFT deck appears without a manual refresh.
  const runningCount = (runs.data ?? []).filter((r) => r.status === 'RUNNING').length;
  const prevRunning = useRef(runningCount);
  useEffect(() => {
    if (runningCount < prevRunning.current) {
      void qc.invalidateQueries({ queryKey: ['admin-decks'] });
    }
    prevRunning.current = runningCount;
  }, [runningCount, qc]);

  const start = useMutation({
    mutationFn: (input: GenerateDeckInput) => generateDeck(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['generation-runs'] });
      await qc.invalidateQueries({ queryKey: ['admin-decks'] });
    },
  });

  return {
    runs: runs.data ?? [],
    isLoading: runs.isLoading,
    generate: start.mutateAsync,
    isGenerating: start.isPending,
    refetchRuns: () => qc.invalidateQueries({ queryKey: ['generation-runs'] }),
  };
}
