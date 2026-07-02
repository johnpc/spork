import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ generateDeck: vi.fn(), regen: vi.fn(), list: vi.fn() }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: {
    mutations: { generateDeck: m.generateDeck, regenerateCardMedia: m.regen },
    models: { GenerationRun: { list: m.list } },
  },
}));

import { generateDeck, regenerateCardMedia, fetchGenerationRuns } from './generateApi';

const EDITOR = { authMode: 'userPool' };

describe('generateApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateDeck returns the run + deck ids', async () => {
    m.generateDeck.mockResolvedValue({ data: { runId: 'r1', deckId: 'd1' }, errors: null });
    expect(
      await generateDeck({ topic: 'A', categorySlug: 'x', cardCount: 5, voiceLanguage: 'en-US' }),
    ).toEqual({
      runId: 'r1',
      deckId: 'd1',
    });
    expect(m.generateDeck).toHaveBeenCalledWith(expect.objectContaining({ topic: 'A' }), EDITOR);
  });

  it('generateDeck throws on error', async () => {
    m.generateDeck.mockResolvedValue({ data: null, errors: [{ message: 'denied' }] });
    await expect(
      generateDeck({ topic: 'A', categorySlug: 'x', cardCount: 5, voiceLanguage: 'en-US' }),
    ).rejects.toThrow('denied');
  });

  it('regenerateCardMedia returns the new path', async () => {
    m.regen.mockResolvedValue({ data: { path: 'media/decks/d1/c1.png' }, errors: null });
    expect(await regenerateCardMedia('c1', 'image')).toBe('media/decks/d1/c1.png');
    expect(m.regen).toHaveBeenCalledWith({ cardId: 'c1', kind: 'image' }, EDITOR);
  });

  it('fetchGenerationRuns lists runs newest first', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: '1', startedAt: '2026-01-01' },
        { id: '2', startedAt: '2026-03-01' },
      ],
    });
    expect((await fetchGenerationRuns()).map((r) => r.id)).toEqual(['2', '1']);
  });
});
