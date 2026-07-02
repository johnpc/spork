/**
 * Pure countdown math, so the timer is testable without a real clock. The hook
 * owns the interval and feeds elapsed milliseconds; this computes the remaining
 * seconds (never negative) and whether time is up. Keeping the arithmetic here
 * means the CRAP/coverage gates are satisfied by plain unit tests.
 */

/** Remaining seconds after `elapsedMs`, clamped at zero. */
export function nextRemaining(totalSeconds: number, elapsedMs: number): number {
  const remaining = totalSeconds - Math.floor(elapsedMs / 1000);
  return remaining > 0 ? remaining : 0;
}

/** Format seconds as m:ss for the HUD. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
