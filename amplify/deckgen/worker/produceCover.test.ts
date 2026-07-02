import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({ generateImage: vi.fn(), putMedia: vi.fn(), resizeWebp: vi.fn() }));
vi.mock('../shared/bedrock', () => ({ generateImage: e.generateImage }));
vi.mock('../shared/s3', () => ({ putMedia: e.putMedia }));
vi.mock('../shared/resizeImage', () => ({ resizeWebp: e.resizeWebp, COVER_IMAGE_SIZE: 640 }));

import { produceCover } from './produceCover';

describe('produceCover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    e.generateImage.mockResolvedValue(new Uint8Array([1]));
    e.resizeWebp.mockResolvedValue(new Uint8Array([2]));
    e.putMedia.mockImplementation((_b, key) => Promise.resolve(key));
  });

  it('generates, resizes, and stores the cover, returning its key', async () => {
    const key = await produceCover('bucket', 'd1', 'Greek Gods');
    expect(key).toBe('media/decks/d1/cover.webp');
    expect(e.resizeWebp).toHaveBeenCalledWith(expect.any(Uint8Array), 640);
    expect(e.putMedia).toHaveBeenCalledWith(
      'bucket',
      'media/decks/d1/cover.webp',
      expect.any(Uint8Array),
      'image/webp',
    );
  });

  it('returns undefined (non-fatal) when generation fails', async () => {
    e.generateImage.mockRejectedValue(new Error('filtered'));
    expect(await produceCover('bucket', 'd1', 'X')).toBeUndefined();
  });
});
