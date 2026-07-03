import { useDaily } from './useDaily';
import { dailyPathForKey } from '../../gameCatalog';

/**
 * Strict one-per-day guard for a play screen. If today's puzzle for this daily
 * key has already been finished on this device, returns the /daily recap path to
 * redirect to; otherwise null (play normally). This makes the play routes
 * themselves honor the daily gate, not just the /daily entry — so a direct link,
 * a list-page tap, or a refresh after finishing all send you back to the recap.
 */
export function useDailyGuard(dailyKey: string): string | null {
  const { playedToday } = useDaily(dailyKey);
  return playedToday ? dailyPathForKey(dailyKey) : null;
}
