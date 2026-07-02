import { useEffect, useRef, useState } from 'react';

/**
 * Elapsed whole seconds since the session started, for games that have no
 * countdown of their own (Steps, Acrostic, Quizzle, Chess) but still want time
 * as part of the daily score. Starts ticking on mount and FREEZES when `done`
 * flips true — so the value read at completion is the final time taken. The
 * `now` provider is injectable for deterministic tests.
 */
export function useElapsed(done: boolean, now: () => number = () => Date.now()): number {
  const start = useRef<number | null>(null);
  const frozen = useRef<number | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (start.current == null) start.current = now();
    if (done) {
      if (frozen.current == null) {
        frozen.current = Math.floor((now() - (start.current ?? now())) / 1000);
        setSeconds(frozen.current);
      }
      return;
    }
    const id = setInterval(() => {
      setSeconds(Math.floor((now() - (start.current ?? now())) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [done, now]);

  return frozen.current ?? seconds;
}
