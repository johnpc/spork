import { useEffect, useRef, useState } from 'react';
import { dataClient } from '../../../lib/dataClient';

type Status = 'idle' | 'generating' | 'ready' | 'error';

/** How long to wait for a generated puzzle to appear before giving up (→ error,
 * which the entry screen renders as a retryable "Couldn't build that day"). The
 * mutation can resolve OK yet the puzzle never lands (silent no-op, or the poll
 * never matches) — without this bound the screen spins on "Building…" forever. */
const GENERATE_TIMEOUT_MS = 25_000;

/**
 * Backfill a past day's puzzles when it has none yet. Fires the guest-callable
 * `generateDailyPuzzles` mutation ONCE (a ref guards StrictMode's double-invoke),
 * then leans on react-query polling elsewhere (useDailyEntry refetches the list)
 * to surface the new puzzle — this hook just owns the trigger + status. Enabled
 * only when `active` (the entry screen decided the day is empty and generatable).
 * `ready` flips true once `found` (the caller's "the puzzle now exists") is set;
 * if nothing lands within `timeoutMs`, it flips to `error` so the user gets a
 * retry instead of an endless spinner. `timeoutMs` injectable for tests.
 */
export function useGenerateDay(
  date: string,
  active: boolean,
  found: boolean,
  timeoutMs = GENERATE_TIMEOUT_MS,
) {
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

  // Give up on a puzzle that never appears (rather than spinning forever).
  useEffect(() => {
    if (status !== 'generating') return;
    const t = setTimeout(() => setStatus((s) => (s === 'generating' ? 'error' : s)), timeoutMs);
    return () => clearTimeout(t);
  }, [status, timeoutMs]);

  return { status, isGenerating: status === 'generating', isError: status === 'error' };
}
