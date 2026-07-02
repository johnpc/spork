import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: { models: { ChessAttack: { get: m.get, list: m.list } } },
  readAuthMode: () => Promise.resolve('identityPool'),
}));

import { fetchPuzzle, fetchPuzzles } from './chessApi';

describe('chessApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchPuzzle returns one puzzle', async () => {
    m.get.mockResolvedValue({ data: { id: 'p1', name: 'Rook Takes All' } });
    expect(await fetchPuzzle('p1')).toEqual({ id: 'p1', name: 'Rook Takes All' });
    expect(m.get).toHaveBeenCalledWith({ id: 'p1' }, { authMode: 'identityPool' });
  });

  it('fetchPuzzles returns only published', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', status: 'PUBLISHED', publishedAt: '2026-01-01' },
        { id: 'b', status: 'DRAFT' },
      ],
    });
    const out = await fetchPuzzles();
    expect(out.map((p) => p.id)).toEqual(['a']);
    expect(m.list).toHaveBeenCalledWith({ limit: 200, authMode: 'identityPool' });
  });
});
