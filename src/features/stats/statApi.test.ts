import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: { models: { UserStat: { list: m.list, create: m.create, update: m.update } } },
}));

import { recordSession, todayStamp, fetchStat } from './statApi';

describe('todayStamp', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(todayStamp(new Date(2026, 5, 9))).toBe('2026-06-09'); // month is 0-based
  });
});

describe('recordSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.create.mockResolvedValue({ errors: null });
    m.update.mockResolvedValue({ errors: null });
  });

  it('creates a first stat row starting the streak at 1', async () => {
    m.list.mockResolvedValue({ data: [] });
    await recordSession(3, new Date('2026-06-10T12:00:00'));
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({ currentStreak: 1, longestStreak: 1, totalReviews: 3 }),
      { authMode: 'userPool' },
    );
  });

  it('updates an existing row, advancing the streak on a consecutive day', async () => {
    m.list.mockResolvedValue({
      data: [
        {
          id: 's1',
          currentStreak: 4,
          longestStreak: 4,
          lastStudiedDate: '2026-06-09',
          totalReviews: 20,
        },
      ],
    });
    await recordSession(2, new Date('2026-06-10T08:00:00'));
    expect(m.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 's1', currentStreak: 5, longestStreak: 5, totalReviews: 22 }),
      { authMode: 'userPool' },
    );
  });

  it('fetchStat returns the first row or null', async () => {
    m.list.mockResolvedValue({ data: [{ id: 's1' }] });
    expect((await fetchStat())?.id).toBe('s1');
    m.list.mockResolvedValue({ data: [] });
    expect(await fetchStat()).toBeNull();
  });
});

it('recordSession throws on write error', async () => {
  m.list.mockResolvedValue({ data: [] });
  m.create.mockResolvedValue({ errors: [{ message: 'denied' }] });
  await expect(recordSession(1, new Date('2026-06-10T00:00:00'))).rejects.toThrow('denied');
});
