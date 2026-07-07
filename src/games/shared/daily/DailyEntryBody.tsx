import { Link } from 'react-router-dom';
import { ComeBackTomorrow } from './ComeBackTomorrow';
import { SkeletonRows } from '../../../features/shell/SkeletonRows';
import type { DailyResult } from './dailyStore';

interface DailyEntryBodyProps {
  gameName: string;
  date: string;
  browsing: boolean;
  playedToday: boolean;
  result: DailyResult | null;
  generating: boolean;
  genError: boolean;
  empty: boolean;
  next: { slug: string; name: string } | null;
}

/** The state body of the daily-entry screen: recap (already finished),
 * generating (backfilling a past day), a graceful empty state, or the loading
 * skeleton. The redirect-into-play case is handled by the parent. */
export function DailyEntryBody(p: DailyEntryBodyProps) {
  if (p.playedToday && p.result) {
    return (
      <ComeBackTomorrow
        game={p.gameName}
        score={p.result.score}
        total={p.result.total}
        timeSeconds={p.result.timeSeconds}
        date={p.date}
        nextTo={p.next ? `/daily/${p.next.slug}` : undefined}
        nextName={p.next?.name}
      />
    );
  }
  if (p.genError) {
    return (
      <div className="daily-empty" data-testid="daily-gen-error">
        <p className="sp-heading">Couldn’t build that day</p>
        <p className="sp-muted">Something went wrong generating this day. Please try again.</p>
        <Link to="/home" className="empty-state__cta">
          Back to games
        </Link>
      </div>
    );
  }
  if (p.generating) {
    return (
      <div data-testid="daily-generating">
        <p className="sp-muted daily-generating__note">
          Building the {gameLabel(p.gameName, p.date)} puzzle…
        </p>
        <SkeletonRows count={4} label="Generating this day’s puzzle" />
      </div>
    );
  }
  if (p.empty) {
    return (
      <div className="daily-empty" data-testid="daily-empty">
        <p className="sp-heading">
          No {p.gameName} puzzle {p.browsing ? 'that day' : 'today yet'}
        </p>
        <p className="sp-muted">A fresh one is generated every day — check back soon.</p>
        <Link to="/home" className="empty-state__cta" data-testid="daily-empty-home">
          Back to games
        </Link>
      </div>
    );
  }
  return (
    <p className="sp-muted" data-testid="daily-loading">
      Loading the puzzle…
    </p>
  );
}

/** "July 2 World Countries" style label for the generating note. */
function gameLabel(game: string, date: string): string {
  return `${date} ${game}`;
}
