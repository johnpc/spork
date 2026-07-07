import { useDaily } from './useDaily';
import { dailyPathForKey } from '../../gameCatalog';

/**
 * Strict one-per-day guard for a play screen. If the puzzle for this daily key on
 * `day` (defaults to today) has already been finished on this device, returns the
 * /daily recap path to redirect to; otherwise null (play normally). This makes
 * the play routes honor the daily gate, not just the /daily entry — so a direct
 * link, a list-page tap, or a refresh after finishing sends you back to the recap.
 * For a PAST day the recap path carries the date so the guard round-trips there.
 */
export function useDailyGuard(dailyKey: string, day?: string): string | null {
  const { playedToday, date } = useDaily(dailyKey, day);
  if (!playedToday) return null;
  const base = dailyPathForKey(dailyKey);
  // Keep past-day recaps on their dated route; today's stays on the bare path.
  return day && base !== '/home' ? `${base}/${date}` : base;
}
