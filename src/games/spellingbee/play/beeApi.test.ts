import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: { models: { SpellingBeePuzzle: { get: m.get, list: m.list } } },
  readAuthMode: () => Promise.resolve('identityPool'),
  unwrap: (r: { data: unknown; errors?: { message: string }[] }) => {
    if (r.errors?.length) throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data;
  },
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

  it('fetchBee throws on a GraphQL error (retryable, not a false not-found)', async () => {
    m.get.mockResolvedValue({ data: null, errors: [{ message: 'boom' }] });
    await expect(fetchBee('x1')).rejects.toThrow('boom');
  });

  it('fetchBees excludes daily-generated puzzles (they live on /daily/spellingbee)', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'evergreen', status: 'PUBLISHED', puzzleDate: '2026-01-01' },
        { id: 'daily-spellingbee-2026-07-15', status: 'PUBLISHED', puzzleDate: '2026-07-15' },
      ],
    });
    const out = await fetchBees();
    expect(out.map((b) => b.id)).toEqual(['evergreen']);
  });
});
