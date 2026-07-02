import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({
  invokeText: vi.fn(),
  parseCards: vi.fn(),
  updateItem: vi.fn(),
  produceCard: vi.fn(),
  produceCover: vi.fn(),
}));
vi.mock('../shared/bedrock', () => ({ invokeText: e.invokeText }));
vi.mock('../shared/cardsPrompt', () => ({ buildCardsRequest: () => 'body' }));
vi.mock('../shared/parseCards', () => ({ parseCards: e.parseCards }));
vi.mock('../shared/ddb', () => ({ updateItem: e.updateItem }));
vi.mock('./produceCard', () => ({ produceCard: e.produceCard }));
vi.mock('./produceCover', () => ({ produceCover: e.produceCover }));

import { handler } from './handler';

const event = { runId: 'r1', deckId: 'd1', topic: 'Spanish', cardCount: 2, voiceLanguage: 'es-ES' };

describe('deckgen worker handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GENERATION_RUN_TABLE = 'runs';
    process.env.DECK_TABLE = 'decks';
    process.env.CARD_TABLE = 'cards';
    process.env.MEDIA_BUCKET = 'bucket';
    e.invokeText.mockResolvedValue({});
    e.parseCards.mockReturnValue([
      { front: 'Hola', back: 'Hello' },
      { front: 'Gracias', back: 'Thanks' },
    ]);
    e.produceCard.mockResolvedValue('cid');
    e.produceCover.mockResolvedValue('media/decks/d1/cover.webp');
    e.updateItem.mockResolvedValue(undefined);
  });

  it('produces a cover + every card then marks the deck + run DRAFT_READY', async () => {
    await handler(event);
    expect(e.produceCover).toHaveBeenCalledWith('bucket', 'd1', 'Spanish');
    expect(e.produceCard).toHaveBeenCalledTimes(2);
    expect(e.updateItem).toHaveBeenCalledWith(
      'decks',
      'd1',
      expect.objectContaining({ cardCount: 2, coverImagePath: 'media/decks/d1/cover.webp' }),
    );
    expect(e.updateItem).toHaveBeenCalledWith(
      'runs',
      'r1',
      expect.objectContaining({ status: 'DRAFT_READY', generatedCount: 2 }),
    );
  });

  it('marks the run FAILED and rethrows when generation throws', async () => {
    e.parseCards.mockImplementation(() => {
      throw new Error('bad model output');
    });
    await expect(handler(event)).rejects.toThrow('bad model output');
    expect(e.updateItem).toHaveBeenCalledWith(
      'runs',
      'r1',
      expect.objectContaining({ status: 'FAILED', statusReason: 'bad model output' }),
    );
  });
});
