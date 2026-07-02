import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ list: vi.fn() }));
const auth = vi.hoisted(() => ({ mode: 'identityPool' as string }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: { models: { Category: { list: m.list } } },
  readAuthMode: () => Promise.resolve(auth.mode),
}));

import { fetchShelves } from './discoverApi';

describe('fetchShelves', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mode = 'identityPool';
    m.list.mockResolvedValue({
      data: [
        { slug: 'myth', name: 'Mythology', sortOrder: 2 },
        { slug: 'lang', name: 'Languages', sortOrder: 1 },
      ],
    });
  });

  it('lists categories and returns ordered shelves', async () => {
    const shelves = await fetchShelves();
    expect(shelves.map((s) => s.slug)).toEqual(['lang', 'myth']);
  });

  it('reads with the resolved auth mode', async () => {
    auth.mode = 'userPool';
    await fetchShelves();
    expect(m.list).toHaveBeenCalledWith(expect.objectContaining({ authMode: 'userPool' }));
  });
});
