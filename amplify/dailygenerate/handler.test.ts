import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({ invokeWorker: vi.fn() }));
vi.mock('./invokeWorker', () => ({ invokeWorker: e.invokeWorker }));

import { handler } from './handler';

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-07T12:00:00Z'));
  process.env.WORKER_FUNCTION_NAME = 'daily-generate-worker';
});

// The starter typing is the full AppSync resolver handler (event, context,
// callback); tests only exercise the event, so cast the whole arg list.
const call = (puzzleDate: string) =>
  (handler as (...a: unknown[]) => Promise<{ date: string; started: boolean }>)({
    arguments: { puzzleDate },
  });

describe('generateDailyPuzzles starter', () => {
  it('validates + async-invokes the worker + returns immediately', async () => {
    const res = await call('2026-03-01');
    expect(e.invokeWorker).toHaveBeenCalledWith('daily-generate-worker', '2026-03-01');
    expect(res).toEqual({ date: '2026-03-01', started: true });
  });

  it('rejects a future date before invoking the worker', async () => {
    await expect(call('2026-07-08')).rejects.toThrow(/future/);
    expect(e.invokeWorker).not.toHaveBeenCalled();
  });

  it('rejects a malformed date', async () => {
    await expect(call('not-a-date')).rejects.toThrow(/invalid/);
    expect(e.invokeWorker).not.toHaveBeenCalled();
  });
});
