import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn() }));
vi.mock('../../../lib/dataClient', () => ({
  dataClient: { models: { WordlePuzzle: { get: m.get, list: m.list } } },
  readAuthMode: () => Promise.resolve('identityPool'),
}));

import { fetchWordle, fetchWordles } from './wordleApi';

describe('wordleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchWordle returns one puzzle', async () => {
    m.get.mockResolvedValue({
      data: {
        id: 'w1',
        answer: 'crane',
        wordLength: 5,
        maxGuesses: 6,
        status: 'PUBLISHED',
        publishedAt: '2026-01-01',
        puzzleDate: '2026-01-01',
      },
    });
    expect(await fetchWordle('w1')).toEqual({
      id: 'w1',
      answer: 'crane',
      wordLength: 5,
      maxGuesses: 6,
      status: 'PUBLISHED',
      publishedAt: '2026-01-01',
      puzzleDate: '2026-01-01',
    });
  });

  it('fetchWordle returns null when puzzle not found', async () => {
    m.get.mockResolvedValue({ data: null });
    expect(await fetchWordle('w1')).toBeNull();
  });

  it('fetchWordle handles missing optional fields', async () => {
    m.get.mockResolvedValue({
      data: {
        id: 'w2',
        answer: null,
        wordLength: null,
        maxGuesses: null,
        status: null,
      },
    });
    const result = await fetchWordle('w2');
    expect(result).toEqual({
      id: 'w2',
      answer: '',
      wordLength: 5,
      maxGuesses: 6,
      status: 'DRAFT',
      publishedAt: undefined,
      puzzleDate: undefined,
    });
  });

  it('fetchWordles returns only published puzzles', async () => {
    m.list.mockResolvedValue({
      data: [
        {
          id: 'a',
          status: 'PUBLISHED',
          answer: 'crane',
          wordLength: 5,
          maxGuesses: 6,
          publishedAt: '2026-01-01',
          puzzleDate: '2026-01-01',
        },
        { id: 'b', status: 'DRAFT', answer: 'hello', wordLength: 5, maxGuesses: 6 },
      ],
    });
    const out = await fetchWordles();
    expect(out.map((p) => p.id)).toEqual(['a']);
    expect(m.list).toHaveBeenCalledWith({ limit: 200, authMode: 'identityPool' });
  });

  it('fetchWordles handles empty results', async () => {
    m.list.mockResolvedValue({ data: [] });
    const out = await fetchWordles();
    expect(out).toEqual([]);
  });

  it('fetchWordles normalizes missing fields', async () => {
    m.list.mockResolvedValue({
      data: [
        {
          id: 'c',
          status: 'PUBLISHED',
          answer: null,
          wordLength: null,
          maxGuesses: null,
        },
      ],
    });
    const out = await fetchWordles();
    expect(out[0]).toEqual({
      id: 'c',
      answer: '',
      wordLength: 5,
      maxGuesses: 6,
      status: 'PUBLISHED',
      publishedAt: undefined,
      puzzleDate: undefined,
    });
  });
});
