import { describe, it, expect } from 'vitest';
import { applySession, projectStat } from './applySession';

const session = { sessionId: 's2', owner: 'me@x.com', day: '2026-06-10', reviewed: 4 };
const stat = {
  currentStreak: 3,
  longestStreak: 5,
  lastStudiedDate: '2026-06-09',
  totalReviews: 20,
  recentSessionIds: ['s1'],
};

describe('applySession', () => {
  it('advances the streak, adds the reviews and remembers the session id', () => {
    expect(applySession(stat, session)).toEqual({
      currentStreak: 4,
      longestStreak: 5,
      lastStudiedDate: '2026-06-10',
      totalReviews: 24,
      recentSessionIds: ['s1', 's2'],
    });
  });

  it('starts a first-ever stat at a 1-day streak', () => {
    expect(applySession(null, session)).toMatchObject({
      currentStreak: 1,
      longestStreak: 1,
      totalReviews: 4,
      recentSessionIds: ['s2'],
    });
  });

  it('returns null for a session the server already applied (idempotent replay)', () => {
    expect(applySession({ ...stat, recentSessionIds: ['s1', 's2'] }, session)).toBeNull();
  });

  it('remembers only the most recent session ids', () => {
    const many = Array.from({ length: 20 }, (_, i) => `old${i}`);
    const next = applySession({ ...stat, recentSessionIds: many }, session);
    expect(next?.recentSessionIds).toHaveLength(20);
    expect(next?.recentSessionIds?.at(-1)).toBe('s2');
    expect(next?.recentSessionIds).not.toContain('old0');
  });
});

describe('projectStat', () => {
  it('overlays unconfirmed sessions on the server stat', () => {
    expect(projectStat(stat, [session])?.currentStreak).toBe(4);
  });

  it('shows a streak from a pending session even before any server row exists', () => {
    expect(projectStat(null, [session])?.currentStreak).toBe(1);
  });

  it('does not double count a pending session the server already has', () => {
    const applied = { ...stat, recentSessionIds: ['s2'] };
    expect(projectStat(applied, [session])?.totalReviews).toBe(20);
  });

  it('passes the server stat through when nothing is pending', () => {
    expect(projectStat(stat, [])).toBe(stat);
    expect(projectStat(null, [])).toBeNull();
  });
});
