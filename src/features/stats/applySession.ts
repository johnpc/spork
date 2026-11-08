/**
 * Pure: fold one finished session into a user's study stat. Idempotent — the
 * stat remembers the ids of the sessions it already counted, so replaying a
 * session whose save actually landed (but whose local outbox entry survived a
 * reload) is a no-op instead of a double count.
 */
import { advanceStreak } from './streak';
import type { PendingSession } from './pendingSessions';

export interface StatFields {
  currentStreak: number;
  longestStreak: number;
  lastStudiedDate: string;
  totalReviews: number;
  recentSessionIds: string[];
}

/** The stat shape we read (server rows have nullable fields). */
export interface StatLike {
  currentStreak?: number | null;
  longestStreak?: number | null;
  lastStudiedDate?: string | null;
  totalReviews?: number | null;
  recentSessionIds?: (string | null)[] | null;
}

/** How many applied session ids a stat remembers (enough to cover any outbox). */
export const RECENT_SESSIONS = 20;

const recentIds = (stat: StatLike | null): string[] =>
  (stat?.recentSessionIds ?? []).filter((id): id is string => !!id);

/** The stat after `session`, or null when the stat already counted it. */
export function applySession(stat: StatLike | null, session: PendingSession): StatFields | null {
  const recent = recentIds(stat);
  if (recent.includes(session.sessionId)) return null;
  const next = advanceStreak(
    {
      currentStreak: stat?.currentStreak ?? 0,
      longestStreak: stat?.longestStreak ?? 0,
      lastStudiedDate: stat?.lastStudiedDate,
    },
    session.day,
  );
  return {
    currentStreak: next.currentStreak,
    longestStreak: next.longestStreak,
    lastStudiedDate: session.day,
    totalReviews: (stat?.totalReviews ?? 0) + session.reviewed,
    recentSessionIds: [...recent, session.sessionId].slice(-RECENT_SESSIONS),
  };
}

/** What the UI should show: the server stat with unconfirmed sessions applied. */
export function projectStat<T extends StatLike>(
  stat: T | null,
  pending: PendingSession[],
): T | StatLike | null {
  return pending.reduce<T | StatLike | null>(
    (acc, session) => applySession(acc, session) ?? acc,
    stat,
  );
}
