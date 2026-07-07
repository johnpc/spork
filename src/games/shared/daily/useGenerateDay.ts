import { useEffect, useRef, useState } from 'react';
import { dataClient } from '../../../lib/dataClient';

type Status = 'idle' | 'generating' | 'ready' | 'error';

/**
 * Backfill a past day's puzzles when it has none yet. Fires the guest-callable
 * `generateDailyPuzzles` mutation ONCE (a ref guards StrictMode's double-invoke),
 * then leans on react-query polling elsewhere (useDailyEntry refetches the list)
 * to surface the new puzzle — this hook just owns the trigger + status. Enabled
 * only when `active` (the entry screen decided the day is empty and generatable).
 * `ready` flips true once `found` (the caller's "the puzzle now exists") is set.
 */
export function useGenerateDay(date: string, active: boolean, found: boolean) {
  const [status, setStatus] = useState<Status>('idle');
  const fired = useRef(false);

  useEffect(() => {
    if (!active || fired.current) return;
    fired.current = true;
    setStatus('generating');
    dataClient.mutations
      .generateDailyPuzzles({ puzzleDate: date })
      .then((r) => {
        if (r.errors?.length) setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, [active, date]);

  useEffect(() => {
    if (found && status === 'generating') setStatus('ready');
  }, [found, status]);

  return { status, isGenerating: status === 'generating', isError: status === 'error' };
}
