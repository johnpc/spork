import { useStat } from './useStat';
import './streak.css';

/** Study-streak card for the You tab: current streak, best, and total reviews.
 * Renders an encouraging zero-state before the first session. */
export function StreakCard() {
  const { stat, isLoading } = useStat();
  if (isLoading) return null;
  const current = stat?.currentStreak ?? 0;
  const longest = stat?.longestStreak ?? 0;
  const total = stat?.totalReviews ?? 0;
  return (
    <section className="streak" data-testid="streak">
      <div className="streak__main">
        <span className="streak__num" data-testid="streak-current">
          {current}
        </span>
        <span className="streak__label">🔥 day{current === 1 ? '' : 's'} streak</span>
      </div>
      {current === 0 ? (
        <p className="streak__hint fs-muted">Study today to start a streak.</p>
      ) : (
        <p className="streak__hint fs-muted">
          Best: {longest} · {total} cards reviewed
        </p>
      )}
    </section>
  );
}
