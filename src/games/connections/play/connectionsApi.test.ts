import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: { models: { ConnectionsPuzzle: { get: m.get, list: m.list } } },
  readAuthMode: () => Promise.resolve('identityPool'),
}));

import { fetchConnections, fetchConnectionsList } from './connectionsApi';

describe('connectionsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchConnections returns one puzzle', async () => {
    m.get.mockResolvedValue({ data: { id: 'c1', groups: '[]' } });
    expect(await fetchConnections('c1')).toEqual({ id: 'c1', groups: '[]' });
  });

  it('fetchConnectionsList returns only published', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', status: 'PUBLISHED', publishedAt: '2026-01-01' },
        { id: 'b', status: 'DRAFT' },
      ],
    });
    const out = await fetchConnectionsList();
    expect(out.map((p) => p.id)).toEqual(['a']);
    expect(m.list).toHaveBeenCalledWith({ limit: 200, authMode: 'identityPool' });
  });
});
