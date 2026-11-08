/**
 * Study-stat read/write. Per-user (owner authz), so userPool auth. One UserStat
 * row per user (upsert). Saving a finished session is outbox-first so it
 * survives a reload or app close mid-save: queue locally → write → dequeue only
 * once the server confirms. flushPending replays whatever is still queued (at
 * the next launch, or when the You tab loads) and is idempotent per session.
 */
import { dataClient, type UserStatRecord } from '../../lib/dataClient';
import { applySession, type StatFields } from './applySession';
import { addPending, loadPending, removePending } from './pendingSessions';

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

/** Deterministic id for a user's FIRST stat row, so two racing first saves
 * collide on one row instead of creating two. */
export const statId = (owner: string): string => `userstat-${owner}`;

async function writeStat(existing: UserStatRecord | null, owner: string, fields: StatFields) {
  const { errors } = existing
    ? await dataClient.models.UserStat.update({ id: existing.id, ...fields }, USER_POOL)
    : await dataClient.models.UserStat.create({ id: statId(owner), ...fields }, USER_POOL);
  if (errors) throw new Error(errors[0]?.message ?? 'Failed to record session.');
}

/** Apply queued sessions oldest-first until the outbox is empty. */
async function drain(owner: string): Promise<void> {
  for (let next = loadPending(owner)[0]; next; next = loadPending(owner)[0]) {
    const existing = await fetchStat();
    const fields = applySession(existing, next);
    if (fields) await writeStat(existing, owner, fields);
    removePending(next.sessionId); // confirmed (or already counted) → dequeue
  }
}

let inflight: Promise<void> | null = null;

/** Replay unconfirmed sessions. Concurrent callers share one in-flight replay,
 * so the same session is never written twice from this app instance. */
export function flushPending(owner: string): Promise<void> {
  inflight ??= drain(owner).finally(() => {
    inflight = null;
  });
  return inflight;
}

/** Record a completed session today: queue it locally, then save it. */
export async function recordSession(
  owner: string,
  reviewed: number,
  now: Date = new Date(),
  newId: () => string = () => crypto.randomUUID(),
): Promise<void> {
  addPending({ sessionId: newId(), owner, day: todayStamp(now), reviewed });
  await flushPending(owner);
}
