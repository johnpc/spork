import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { recordSession } from '../stats/statApi';

/**
 * Record a completed study session exactly once when `done` flips true, then
 * re-arm if the session restarts (reset/direction toggle). An effect — not a
 * setState side effect — so it fires reliably; a ref guards StrictMode double
 * invoke. Best-effort: a stats write must never break studying.
 */
export function useRecordOnDone(done: boolean, reviewed: number): void {
  const queryClient = useQueryClient();
  const recorded = useRef(false);
  useEffect(() => {
    if (done && !recorded.current) {
      recorded.current = true;
      void recordSession(reviewed)
        .then(() => queryClient.invalidateQueries({ queryKey: ['user-stat'] }))
        .catch(() => {});
    }
    if (!done) recorded.current = false;
  }, [done, reviewed, queryClient]);
}
