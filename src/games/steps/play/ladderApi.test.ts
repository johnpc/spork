import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: { models: { WordLadder: { get: m.get, list: m.list } } },
  readAuthMode: () => Promise.resolve('identityPool'),
}));

import { fetchLadder, fetchLadders } from './ladderApi';

describe('ladderApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchLadder returns one ladder', async () => {
    m.get.mockResolvedValue({ data: { id: 'l1', start: 'cat' } });
    expect(await fetchLadder('l1')).toEqual({ id: 'l1', start: 'cat' });
  });

  it('fetchLadders returns only published', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', status: 'PUBLISHED', publishedAt: '2026-01-01' },
        { id: 'b', status: 'DRAFT' },
      ],
    });
    const out = await fetchLadders();
    expect(out.map((l) => l.id)).toEqual(['a']);
    expect(m.list).toHaveBeenCalledWith({ limit: 200, authMode: 'identityPool' });
  });
});
