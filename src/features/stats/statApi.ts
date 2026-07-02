/**
 * Study-stat read/write. Per-user (owner authz), so userPool auth. One UserStat
 * row per user (upsert): the first session creates it, later sessions update it.
 * The streak math is the pure advanceStreak; this is just the I/O around it.
 */
import { dataClient, type UserStatRecord } from '../../lib/dataClient';
import { advanceStreak } from './streak';

const USER_POOL = { authMode: 'userPool' } as const;

/** Local calendar day as YYYY-MM-DD (streaks are by the user's local day). */
export function todayStamp(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** The user's stat row, or null if they've never studied. */
export async function fetchStat(): Promise<UserStatRecord | null> {
  const { data } = await dataClient.models.UserStat.list({ limit: 1, ...USER_POOL });
  return data[0] ?? null;
}

/** Record a completed session today: advance the streak + bump totals (upsert). */
export async function recordSession(reviewed: number, now: Date = new Date()): Promise<void> {
  const today = todayStamp(now);
  const existing = await fetchStat();
  const next = advanceStreak(
    {
      currentStreak: existing?.currentStreak ?? 0,
      longestStreak: existing?.longestStreak ?? 0,
      lastStudiedDate: existing?.lastStudiedDate,
    },
    today,
  );
  const fields = {
    currentStreak: next.currentStreak,
    longestStreak: next.longestStreak,
    lastStudiedDate: next.lastStudiedDate,
    totalReviews: (existing?.totalReviews ?? 0) + reviewed,
  };
  const { errors } = existing
    ? await dataClient.models.UserStat.update({ id: existing.id, ...fields }, USER_POOL)
    : await dataClient.models.UserStat.create(fields, USER_POOL);
  if (errors) throw new Error(errors[0]?.message ?? 'Failed to record session.');
}
