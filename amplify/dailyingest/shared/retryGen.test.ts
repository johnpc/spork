import { describe, it, expect, vi } from 'vitest';
import { retryGen } from './retryGen';

describe('retryGen', () => {
  it('returns the first valid value', async () => {
    const once = vi.fn().mockResolvedValue({ ok: true, value: 42 });
    expect(await retryGen('x', 3, once)).toBe(42);
    expect(once).toHaveBeenCalledTimes(1);
  });

  it('retries past invalid candidates then succeeds', async () => {
    const once = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, reason: 'bad' })
      .mockResolvedValueOnce({ ok: true, value: 'good' });
    expect(await retryGen('x', 3, once)).toBe('good');
    expect(once).toHaveBeenCalledTimes(2);
  });

  it('treats a thrown attempt (malformed response) as a failure and retries', async () => {
    const once = vi
      .fn()
      .mockRejectedValueOnce(new Error('parse blew up'))
      .mockResolvedValueOnce({ ok: true, value: 1 });
    expect(await retryGen('x', 3, once)).toBe(1);
  });

  it('throws with the last reason after exhausting attempts', async () => {
    const once = vi.fn().mockResolvedValue({ ok: false, reason: 'still bad' });
    await expect(retryGen('quiz', 2, once)).rejects.toThrow(/quiz.*still bad/);
    expect(once).toHaveBeenCalledTimes(2);
  });
});
