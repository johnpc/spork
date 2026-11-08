import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: { models: { UserStat: { list: m.list, create: m.create, update: m.update } } },
}));

import { recordSession, flushPending, todayStamp, fetchStat } from './statApi';
import { addPending, loadPending } from './pendingSessions';

const ME = 'me@x.com';
const USER_POOL = { authMode: 'userPool' };
const row = (over = {}) => ({
  id: 's1',
  currentStreak: 4,
  longestStreak: 4,
  lastStudiedDate: '2026-06-09',
  totalReviews: 20,
  recentSessionIds: [],
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  m.create.mockResolvedValue({ errors: null });
  m.update.mockResolvedValue({ errors: null });
});

describe('todayStamp', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(todayStamp(new Date(2026, 5, 9))).toBe('2026-06-09'); // month is 0-based
  });
});

describe('recordSession', () => {
  it('creates a first stat row under a deterministic per-user id', async () => {
    m.list.mockResolvedValue({ data: [] });
    await recordSession(ME, 3, new Date('2026-06-10T12:00:00'), () => 'sess-1');
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: `userstat-${ME}`,
        currentStreak: 1,
        totalReviews: 3,
        recentSessionIds: ['sess-1'],
      }),
      USER_POOL,
    );
    expect(loadPending(ME)).toEqual([]); // confirmed → outbox cleared
  });

  it('updates an existing row, advancing the streak on a consecutive day', async () => {
    m.list.mockResolvedValue({ data: [row()] });
    await recordSession(ME, 2, new Date('2026-06-10T08:00:00'), () => 'sess-2');
    expect(m.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 's1', currentStreak: 5, longestStreak: 5, totalReviews: 22 }),
      USER_POOL,
    );
  });

  it('keeps the session in the outbox when the write fails, so it can be replayed', async () => {
    m.list.mockResolvedValue({ data: [] });
    m.create.mockResolvedValue({ errors: [{ message: 'denied' }] });
    await expect(recordSession(ME, 1, new Date('2026-06-10T00:00:00'), () => 'x')).rejects.toThrow(
      'denied',
    );
    expect(loadPending(ME).map((s) => s.sessionId)).toEqual(['x']);
  });
});

describe('flushPending (replay at next launch)', () => {
  const lost = { sessionId: 'lost', owner: ME, day: '2026-06-10', reviewed: 5 };

  it('replays a session whose save was cut off by a reload', async () => {
    addPending(lost); // left behind by an interrupted recordSession
    m.list.mockResolvedValue({ data: [row()] });
    await flushPending(ME);
    expect(m.update).toHaveBeenCalledTimes(1);
    expect(m.update).toHaveBeenCalledWith(
      expect.objectContaining({ currentStreak: 5, totalReviews: 25, recentSessionIds: ['lost'] }),
      USER_POOL,
    );
    expect(loadPending(ME)).toEqual([]);
  });

  it('is idempotent: a session the server already applied is dropped, not re-counted', async () => {
    addPending(lost); // the write landed but the outbox entry survived the reload
    m.list.mockResolvedValue({ data: [row({ recentSessionIds: ['lost'] })] });
    await flushPending(ME);
    await flushPending(ME);
    expect(m.update).not.toHaveBeenCalled();
    expect(m.create).not.toHaveBeenCalled();
    expect(loadPending(ME)).toEqual([]);
  });

  it('shares one in-flight replay between concurrent callers', async () => {
    addPending(lost);
    m.list.mockResolvedValue({ data: [row()] });
    await Promise.all([flushPending(ME), flushPending(ME)]);
    expect(m.update).toHaveBeenCalledTimes(1);
  });
});

it('fetchStat returns the first row or null', async () => {
  m.list.mockResolvedValue({ data: [{ id: 's1' }] });
  expect((await fetchStat())?.id).toBe('s1');
  m.list.mockResolvedValue({ data: [] });
  expect(await fetchStat()).toBeNull();
});
