import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: { models: { SpellingBeePuzzle: { get: m.get, list: m.list } } },
  readAuthMode: () => Promise.resolve('identityPool'),
}));

import { fetchBee, fetchBees } from './beeApi';

describe('beeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchBee returns one puzzle', async () => {
    m.get.mockResolvedValue({ data: { id: 'b1', letters: 'abcdefg' } });
    expect(await fetchBee('b1')).toEqual({ id: 'b1', letters: 'abcdefg' });
  });

  it('fetchBees returns only published', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', status: 'PUBLISHED', publishedAt: '2026-01-01' },
        { id: 'b', status: 'DRAFT' },
      ],
    });
    const out = await fetchBees();
    expect(out.map((b) => b.id)).toEqual(['a']);
    expect(m.list).toHaveBeenCalledWith({ limit: 200, authMode: 'identityPool' });
  });
});
