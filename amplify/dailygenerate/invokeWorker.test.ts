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

  it('async-invokes the worker (Event) with the puzzle date', async () => {
    await invokeWorker('daily-generate-worker', '2026-02-10');
    const input = send.mock.calls[0][0].input;
    expect(input.FunctionName).toBe('daily-generate-worker');
    expect(input.InvocationType).toBe('Event');
    expect(JSON.parse(input.Payload.toString())).toEqual({ puzzleDate: '2026-02-10' });
  });
});
