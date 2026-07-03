import { useCallback, useEffect, useRef, useState } from 'react';
import { nextRemaining } from './tickTimer';

/**
 * The quiz countdown: owns the remaining-seconds state + the wall-clock tick,
 * decoupled from the found-set/scoring engine. `running` drives the interval;
 * when it expires the clock hits 0 and calls `onExpire` once. `begin` (re)starts
 * from the full limit; `beginIfIdle` starts the clock without resetting it (used
 * to auto-start on first interaction). Extracted from usePlay so the timer is
 * unit-testable on its own and the play hook stays small.
 */
export function useCountdown(limit: number, running: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(limit);
  const startedAt = useRef<number | null>(null);

  const begin = useCallback(() => {
    setRemaining(limit);
    startedAt.current = Date.now();
  }, [limit]);

  const beginIfIdle = useCallback(() => {
    if (startedAt.current == null) startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const left = nextRemaining(limit, Date.now() - (startedAt.current ?? Date.now()));
      setRemaining(left);
      if (left <= 0) onExpire();
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [running, limit, onExpire]);

  return { remaining, begin, beginIfIdle };
}
