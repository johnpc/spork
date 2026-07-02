import { describe, it, expect, vi, beforeEach } from 'vitest';

const send = vi.hoisted(() => vi.fn());
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({ send })),
  PutObjectCommand: vi.fn((input) => ({ input })),
}));

import { putMedia } from './s3';

describe('putMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    send.mockResolvedValue({});
  });

  it('puts the bytes and returns the key', async () => {
    const key = await putMedia('bucket', 'media/decks/d1/c1.png', new Uint8Array([1]), 'image/png');
    expect(key).toBe('media/decks/d1/c1.png');
    expect(send).toHaveBeenCalledTimes(1);
  });
});
