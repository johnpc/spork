import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: { models: { Quiz: { list: m.list } } },
  readAuthMode: () => Promise.resolve('identityPool'),
}));

import { fetchPublishedQuizzes } from './quizListApi';

describe('fetchPublishedQuizzes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists quizzes and returns only published ones', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', status: 'PUBLISHED', publishedAt: '2026-06-01T00:00:00Z' },
        { id: 'b', status: 'DRAFT' },
      ],
    });
    const out = await fetchPublishedQuizzes();
    expect(out.map((q) => q.id)).toEqual(['a']);
    expect(m.list).toHaveBeenCalledWith({ limit: 200, authMode: 'identityPool' });
  });
});
