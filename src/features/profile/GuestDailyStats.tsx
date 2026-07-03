import { useMemo } from 'react';
import { GAMES } from '../home/homeGames';
import { useDailyProgress } from '../home/useDailyProgress';
import { useDailyStreak } from '../home/useDailyStreak';
import './guestStats.css';

/** Device-local daily stats for a signed-OUT visitor on the You tab. Reuses the
 * same localStorage-derived hooks as the Home hero so a guest sees their own
 * progress here too — today's games-done tally and their streak. Renders nothing
 * until they've played at least one game (no empty "0/13" noise). */
export function GuestDailyStats() {
  const keys = useMemo(() => GAMES.map((g) => g.dailyKey), []);
  const progress = useDailyProgress(keys);
  const streak = useDailyStreak();

  if (progress.done === 0 && streak === 0) return null;

  return (
    <section className="guest-stats" data-testid="guest-stats">
      <div className="guest-stats__row">
        <span className="guest-stats__num" data-testid="guest-stats-done">
          {progress.done}
          <span className="guest-stats__den">/{progress.total}</span>
        </span>
        <span className="guest-stats__label">games done today</span>
      </div>
      {streak > 0 && (
        <p className="guest-stats__streak" data-testid="guest-stats-streak">
          🔥 {streak}-day streak
        </p>
      )}
    </section>
  );
}
