import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: { models: { Acrostic: { get: m.get, list: m.list } } },
  readAuthMode: () => Promise.resolve('identityPool'),
  unwrap: (r: { data: unknown; errors?: { message: string }[] }) => {
    if (r.errors?.length) throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data;
  },
}));

import { fetchAcrostic, fetchAcrostics } from './acrosticApi';

describe('acrosticApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchAcrostic returns one acrostic', async () => {
    m.get.mockResolvedValue({ data: { id: 'a1', title: 'On Trying' } });
    expect(await fetchAcrostic('a1')).toEqual({ id: 'a1', title: 'On Trying' });
    expect(m.get).toHaveBeenCalledWith({ id: 'a1' }, { authMode: 'identityPool' });
  });

  it('fetchAcrostics returns only published', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', status: 'PUBLISHED', publishedAt: '2026-01-01' },
        { id: 'b', status: 'DRAFT' },
      ],
    });
    const out = await fetchAcrostics();
    expect(out.map((a) => a.id)).toEqual(['a']);
    expect(m.list).toHaveBeenCalledWith({ limit: 200, authMode: 'identityPool' });
  });

  it('fetchAcrostic throws on a GraphQL error (retryable, not a false not-found)', async () => {
    m.get.mockResolvedValue({ data: null, errors: [{ message: 'boom' }] });
    await expect(fetchAcrostic('x1')).rejects.toThrow('boom');
  });
});
