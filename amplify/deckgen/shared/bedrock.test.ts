import { describe, it, expect, vi, beforeEach } from 'vitest';

const send = vi.hoisted(() => vi.fn());
vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: vi.fn(() => ({ send })),
  InvokeModelCommand: vi.fn((input) => ({ input })),
}));

import { invokeText, generateImage } from './bedrock';

const encode = (obj: unknown) => ({ body: new TextEncoder().encode(JSON.stringify(obj)) });

describe('bedrock edges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invokeText decodes the JSON response body', async () => {
    send.mockResolvedValue(encode({ content: [{ type: 'tool_use' }] }));
    expect(await invokeText('body')).toEqual({ content: [{ type: 'tool_use' }] });
  });

  it('generateImage returns decoded image bytes', async () => {
    const b64 = Buffer.from([1, 2, 3]).toString('base64');
    send.mockResolvedValue(encode({ images: [b64] }));
    const bytes = await generateImage('a cat');
    expect(Array.from(bytes)).toEqual([1, 2, 3]);
  });

  it('generateImage throws when the image was filtered', async () => {
    send.mockResolvedValue(encode({ finish_reasons: ['CONTENT_FILTERED'] }));
    await expect(generateImage('x')).rejects.toThrow(/did not complete/);
  });

  it('generateImage throws when no image is returned', async () => {
    send.mockResolvedValue(encode({ images: [] }));
    await expect(generateImage('x')).rejects.toThrow(/missing image/);
  });
});
