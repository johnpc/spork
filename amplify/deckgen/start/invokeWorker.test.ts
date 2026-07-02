import { describe, it, expect, vi, beforeEach } from 'vitest';

const send = vi.hoisted(() => vi.fn());
vi.mock('@aws-sdk/client-lambda', () => ({
  LambdaClient: vi.fn(() => ({ send })),
  InvokeCommand: vi.fn((input) => ({ input })),
}));

import { invokeWorker } from './invokeWorker';

describe('invokeWorker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    send.mockResolvedValue({});
  });

  it('async-invokes the worker (Event) with the job payload', async () => {
    await invokeWorker('worker-fn', {
      runId: 'r1',
      deckId: 'd1',
      topic: 'Spanish',
      cardCount: 10,
      voiceLanguage: 'es-ES',
    });
    const input = send.mock.calls[0][0].input;
    expect(input.FunctionName).toBe('worker-fn');
    expect(input.InvocationType).toBe('Event');
    expect(JSON.parse(input.Payload.toString())).toMatchObject({ runId: 'r1', deckId: 'd1' });
  });
});
