import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ create: vi.fn(), list: vi.fn(), del: vi.fn() }));
vi.mock('./seedClient', () => ({
  client: { models: { Category: { create: m.create, list: m.list, delete: m.del } } },
  EDITOR_WRITE: { authMode: 'userPool' },
  clearOneModel: (model: { list: typeof m.list }) => {
    void model;
    return Promise.resolve(0);
  },
}));

import { clearAll, seedReferenceData, ensureCategories } from './seedReference';

describe('seedReferenceData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.create.mockResolvedValue({ data: { id: 'c1' }, errors: null });
  });

  it('creates one Category per fixture row with editor auth', async () => {
    const count = await seedReferenceData();
    expect(count).toBe(6);
    expect(m.create).toHaveBeenCalledTimes(6);
    expect(m.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'languages' }), {
      authMode: 'userPool',
    });
    expect(m.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'geography' }), {
      authMode: 'userPool',
    });
  });

  it('throws when a create returns errors', async () => {
    m.create.mockResolvedValueOnce({ data: null, errors: [{ message: 'denied' }] });
    await expect(seedReferenceData()).rejects.toThrow(/Category/);
  });

  it('clearAll wipes the Category model', async () => {
    await expect(clearAll()).resolves.toBeUndefined();
  });
});

describe('ensureCategories (non-destructive)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.create.mockResolvedValue({ data: { id: 'c1' }, errors: null });
  });

  it('creates only the missing categories and never clears', async () => {
    // Prod already has languages + mythology; the other 4 are missing.
    m.list.mockResolvedValue({ data: [{ slug: 'languages' }, { slug: 'mythology' }] });
    const created = await ensureCategories();
    expect(created).toBe(4);
    expect(m.create).toHaveBeenCalledTimes(4);
    expect(m.del).not.toHaveBeenCalled();
    const slugs = m.create.mock.calls.map((c) => c[0].slug);
    expect(slugs).toEqual(['scripture', 'science', 'history', 'geography']);
  });

  it('creates nothing when all categories already exist', async () => {
    m.list.mockResolvedValue({
      data: ['languages', 'mythology', 'scripture', 'science', 'history', 'geography'].map(
        (slug) => ({ slug }),
      ),
    });
    expect(await ensureCategories()).toBe(0);
    expect(m.create).not.toHaveBeenCalled();
  });
});
