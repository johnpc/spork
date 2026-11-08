import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { recordSession } from '../stats/statApi';
import { useAuth } from '../auth/useAuth';

/**
 * Record a completed study session exactly once when `done` flips true, then
 * re-arm if the session restarts (reset/direction toggle). An effect — not a
 * setState side effect — so it fires reliably; a ref guards StrictMode double
 * invoke. recordSession queues the session locally before saving, so a reload
 * or app close mid-save is replayed at the next launch; the You tab reads the
 * queued session right away. Best-effort: a stats write must never break study.
 */
export function useRecordOnDone(done: boolean, reviewed: number): void {
  const queryClient = useQueryClient();
  const { email } = useAuth();
  const recorded = useRef(false);
  useEffect(() => {
    if (done && email && !recorded.current) {
      recorded.current = true;
      void recordSession(email, reviewed)
        .catch(() => {}) // stays queued; replayed later
        .finally(() => queryClient.invalidateQueries({ queryKey: ['user-stat'] }));
    }
    if (!done) recorded.current = false;
  }, [done, email, reviewed, queryClient]);
}
