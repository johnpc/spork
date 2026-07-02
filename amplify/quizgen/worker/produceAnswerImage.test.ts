import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({ generateImage: vi.fn(), resizeWebp: vi.fn(), putMedia: vi.fn() }));
vi.mock('../../deckgen/shared/bedrock', () => ({ generateImage: e.generateImage }));
vi.mock('../../deckgen/shared/resizeImage', () => ({
  resizeWebp: e.resizeWebp,
  CARD_IMAGE_SIZE: 512,
}));
vi.mock('../../deckgen/shared/s3', () => ({ putMedia: e.putMedia }));

import { produceAnswerImage } from './produceAnswerImage';

describe('produceAnswerImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    e.generateImage.mockResolvedValue(new Uint8Array([1]));
    e.resizeWebp.mockResolvedValue(new Uint8Array([2]));
    e.putMedia.mockImplementation((_b: string, key: string) => Promise.resolve(key));
  });

  it('draws, resizes, and stores under the quiz media key', async () => {
    const key = await produceAnswerImage({ bucket: 'b', quizId: 'q1' }, 'q1#0', 'a lion');
    expect(e.generateImage).toHaveBeenCalledWith(expect.stringContaining('a lion'));
    expect(e.resizeWebp).toHaveBeenCalledWith(expect.any(Uint8Array), 512);
    expect(e.putMedia).toHaveBeenCalledWith(
      'b',
      'media/quizzes/q1/q1#0.webp',
      expect.any(Uint8Array),
      'image/webp',
    );
    expect(key).toBe('media/quizzes/q1/q1#0.webp');
  });
});
