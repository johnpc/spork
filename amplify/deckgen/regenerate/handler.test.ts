import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({
  generateImage: vi.fn(),
  synthesizeSpeech: vi.fn(),
  putMedia: vi.fn(),
  getItem: vi.fn(),
  updateItem: vi.fn(),
}));
vi.mock('../shared/bedrock', () => ({ generateImage: e.generateImage }));
vi.mock('../shared/polly', () => ({ synthesizeSpeech: e.synthesizeSpeech }));
vi.mock('../shared/s3', () => ({ putMedia: e.putMedia }));
vi.mock('../shared/ddb', () => ({ getItem: e.getItem, updateItem: e.updateItem }));
vi.mock('../shared/resizeImage', () => ({
  resizeWebp: (b: Uint8Array) => Promise.resolve(b),
  CARD_IMAGE_SIZE: 512,
}));

import { handler } from './handler';

const call = (kind: string) =>
  handler(
    { arguments: { cardId: 'c1', kind } } as Parameters<typeof handler>[0],
    {} as never,
    {} as never,
  );

describe('regenerateCardMedia handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CARD_TABLE = 'cards';
    process.env.DECK_TABLE = 'decks';
    process.env.MEDIA_BUCKET = 'bucket';
    e.getItem.mockImplementation((table: string) =>
      table === 'cards'
        ? Promise.resolve({ deckId: 'd1', front: 'Hola' })
        : Promise.resolve({ topic: 'Spanish', voiceLanguage: 'es-ES' }),
    );
    e.generateImage.mockResolvedValue(new Uint8Array([1]));
    e.synthesizeSpeech.mockResolvedValue(new Uint8Array([2]));
    e.putMedia.mockImplementation((_b, key) => Promise.resolve(key));
    e.updateItem.mockResolvedValue(undefined);
  });

  it('regenerates the image and updates imagePath', async () => {
    const out = await call('image');
    expect(out).toEqual({ path: 'media/decks/d1/c1.webp' });
    expect(e.updateItem).toHaveBeenCalledWith(
      'cards',
      'c1',
      expect.objectContaining({ imagePath: out?.path }),
    );
  });

  it('regenerates the audio with the deck voice and updates audioPath', async () => {
    const out = await call('audio');
    expect(out).toEqual({ path: 'media/decks/d1/c1.mp3' });
    expect(e.synthesizeSpeech).toHaveBeenCalledWith('Hola', {
      voiceId: 'Lucia',
      languageCode: 'es-ES',
    });
  });

  it('throws on an unknown media kind', async () => {
    await expect(call('video')).rejects.toThrow(/unknown media kind/);
  });

  it('throws when the card is missing', async () => {
    e.getItem.mockResolvedValueOnce(null);
    await expect(call('image')).rejects.toThrow(/card not found/);
  });
});
