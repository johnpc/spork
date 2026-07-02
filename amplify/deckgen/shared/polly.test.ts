import { describe, it, expect, vi, beforeEach } from 'vitest';

const send = vi.hoisted(() => vi.fn());
vi.mock('@aws-sdk/client-polly', () => ({
  PollyClient: vi.fn(() => ({ send })),
  SynthesizeSpeechCommand: vi.fn((input) => ({ input })),
}));

import { synthesizeSpeech } from './polly';

const voice = { voiceId: 'Lucia', languageCode: 'es-ES' };

describe('synthesizeSpeech', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the audio bytes from the stream', async () => {
    send.mockResolvedValue({ AudioStream: { transformToByteArray: () => new Uint8Array([9, 8]) } });
    const bytes = await synthesizeSpeech('Hola', voice);
    expect(Array.from(bytes)).toEqual([9, 8]);
  });

  it('throws when Polly returns no audio stream', async () => {
    send.mockResolvedValue({});
    await expect(synthesizeSpeech('Hola', voice)).rejects.toThrow(/missing audio/);
  });
});
