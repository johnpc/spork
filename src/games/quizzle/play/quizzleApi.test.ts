import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: { models: { Quizzle: { get: m.get, list: m.list } } },
  readAuthMode: () => Promise.resolve('identityPool'),
}));

import { fetchQuizzle, fetchQuizzles } from './quizzleApi';

describe('quizzleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchQuizzle returns one quizzle', async () => {
    m.get.mockResolvedValue({ data: { id: 'q1', topic: 'Capitals' } });
    expect(await fetchQuizzle('q1')).toEqual({ id: 'q1', topic: 'Capitals' });
    expect(m.get).toHaveBeenCalledWith({ id: 'q1' }, { authMode: 'identityPool' });
  });

  it('fetchQuizzles returns only published', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', status: 'PUBLISHED', publishedAt: '2026-01-01' },
        { id: 'b', status: 'DRAFT' },
      ],
    });
    const out = await fetchQuizzles();
    expect(out.map((q) => q.id)).toEqual(['a']);
    expect(m.list).toHaveBeenCalledWith({ limit: 200, authMode: 'identityPool' });
  });
});
