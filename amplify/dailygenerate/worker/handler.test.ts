import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({ generateDayFor: vi.fn(), getItem: vi.fn() }));
vi.mock('../../dailyingest/shared/generateDay', async (orig) => ({
  ...(await orig<typeof import('../../dailyingest/shared/generateDay')>()),
  generateDayFor: e.generateDayFor,
}));
vi.mock('../../deckgen/shared/ddb', () => ({ getItem: e.getItem }));

import { runGeneration, handler } from './handler';

beforeEach(() => {
  vi.clearAllMocks();
  for (const t of ['QUIZ_TABLE', 'ANSWER_TABLE', 'WORDLE_TABLE']) process.env[t] = t.toLowerCase();
});

describe('daily-generate worker', () => {
  it('generates the day, passing an exists guard for idempotency', async () => {
    e.generateDayFor.mockResolvedValue([true, true, true]);
    await runGeneration('2026-03-01');
    expect(e.generateDayFor).toHaveBeenCalledWith(
      '2026-03-01',
      expect.any(Function),
      expect.any(Function),
    );
  });

  it('throws on a total wipeout so the Errors metric fires', async () => {
    e.generateDayFor.mockResolvedValue([false, false]);
    await expect(runGeneration('2026-03-01')).rejects.toThrow(/produced NOTHING/);
  });

  it('handler runs generation for the event date', async () => {
    e.generateDayFor.mockResolvedValue([true]);
    await handler({ puzzleDate: '2026-03-01' });
    expect(e.generateDayFor).toHaveBeenCalledWith('2026-03-01', expect.any(Function), expect.any(Function)); // prettier-ignore
  });
});
