import { describe, it, expect, vi, beforeEach } from 'vitest';

// sharp has a fluent API: sharp(buf).resize(...).webp(...).toBuffer().
const toBuffer = vi.hoisted(() => vi.fn());
const webp = vi.hoisted(() => vi.fn());
const resize = vi.hoisted(() => vi.fn());
const sharp = vi.hoisted(() => vi.fn());
vi.mock('sharp', () => ({ default: sharp }));

import { resizeWebp, CARD_IMAGE_SIZE, COVER_IMAGE_SIZE } from './resizeImage';

describe('resizeWebp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toBuffer.mockResolvedValue(Buffer.from([1, 2, 3]));
    webp.mockReturnValue({ toBuffer });
    resize.mockReturnValue({ webp });
    sharp.mockReturnValue({ resize });
  });

  it('resizes to a max square without enlarging and encodes webp', async () => {
    const out = await resizeWebp(new Uint8Array([9]), CARD_IMAGE_SIZE);
    expect(resize).toHaveBeenCalledWith(CARD_IMAGE_SIZE, CARD_IMAGE_SIZE, {
      fit: 'inside',
      withoutEnlargement: true,
    });
    expect(webp).toHaveBeenCalledWith({ quality: 78 });
    expect(Array.from(out)).toEqual([1, 2, 3]);
  });

  it('exposes sensible card + cover sizes', () => {
    expect(CARD_IMAGE_SIZE).toBeLessThanOrEqual(COVER_IMAGE_SIZE);
    expect(CARD_IMAGE_SIZE).toBeLessThan(1024);
  });
});
