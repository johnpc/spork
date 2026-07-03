import { useEffect, useState } from 'react';
import { formatCountdown, msUntilMidnight } from './nextPuzzle';

/** Live "next puzzle in Hh MMm" line on a daily recap — ticks once a minute so
 * the wait feels concrete. The math is the pure msUntilMidnight/formatCountdown;
 * this only holds the interval. */
export function NextPuzzleCountdown() {
  const [ms, setMs] = useState(() => msUntilMidnight(new Date()));

  useEffect(() => {
    const id = setInterval(() => setMs(msUntilMidnight(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="come-back__countdown sp-muted" data-testid="next-puzzle-countdown">
      Next puzzle in {formatCountdown(ms)}
    </p>
  );
}
