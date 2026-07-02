import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({
  generateImage: vi.fn(),
  synthesizeSpeech: vi.fn(),
  putMedia: vi.fn(),
  putItem: vi.fn(),
}));
vi.mock('../shared/bedrock', () => ({ generateImage: e.generateImage }));
vi.mock('../shared/polly', () => ({ synthesizeSpeech: e.synthesizeSpeech }));
vi.mock('../shared/s3', () => ({ putMedia: e.putMedia }));
vi.mock('../shared/ddb', () => ({ putItem: e.putItem }));
vi.mock('../shared/resizeImage', () => ({
  resizeWebp: (b: Uint8Array) => Promise.resolve(b),
  CARD_IMAGE_SIZE: 512,
}));

import { produceCard, type ProduceCardCtx } from './produceCard';

const ctx: ProduceCardCtx = {
  bucket: 'b',
  cardTable: 't',
  deckId: 'd1',
  topic: 'Spanish',
  voice: { voiceId: 'Lucia', languageCode: 'es-ES' },
  now: '2026-06-01T00:00:00.000Z',
};
const card = { front: 'Hola', back: 'Hello' };

describe('produceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    e.generateImage.mockResolvedValue(new Uint8Array([1]));
    e.synthesizeSpeech.mockResolvedValue(new Uint8Array([2]));
    e.putMedia.mockImplementation((_b, key) => Promise.resolve(key));
    e.putItem.mockResolvedValue(undefined);
  });

  it('generates image + audio and writes the card with both paths', async () => {
    await produceCard(ctx, 'c1', 0, card);
    expect(e.putMedia).toHaveBeenCalledTimes(2);
    const item = e.putItem.mock.calls[0][1];
    expect(item).toMatchObject({
      id: 'c1',
      imagePath: 'media/decks/d1/c1.webp',
      audioPath: 'media/decks/d1/c1.mp3',
    });
  });

  it('still writes the card when image generation fails (non-fatal)', async () => {
    e.generateImage.mockRejectedValue(new Error('filtered'));
    await produceCard(ctx, 'c1', 0, card);
    const item = e.putItem.mock.calls[0][1];
    expect(item.imagePath).toBeUndefined();
    expect(item.audioPath).toBe('media/decks/d1/c1.mp3');
  });

  it('still writes the card when audio fails (non-fatal)', async () => {
    e.synthesizeSpeech.mockRejectedValue(new Error('polly down'));
    await produceCard(ctx, 'c1', 0, card);
    const item = e.putItem.mock.calls[0][1];
    expect(item.audioPath).toBeUndefined();
    expect(item.imagePath).toBe('media/decks/d1/c1.webp');
  });
});
