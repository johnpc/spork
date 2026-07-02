import { describe, it, expect, vi, beforeEach } from 'vitest';

const send = vi.hoisted(() => vi.fn());
vi.mock('@aws-sdk/client-dynamodb', () => ({ DynamoDBClient: vi.fn() }));
vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: { from: () => ({ send }) },
  BatchWriteCommand: vi.fn((input) => ({ input })),
}));

import { chunk, batchPut } from './batchWrite';

describe('chunk', () => {
  it('splits into groups no larger than size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it('returns [] for an empty list', () => {
    expect(chunk([], 25)).toEqual([]);
  });
});

describe('batchPut', () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue(undefined);
  });

  it('sends one BatchWrite request per 25-item chunk', async () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ id: String(i) }));
    await batchPut('answers', items);
    expect(send).toHaveBeenCalledTimes(2);
    const first = send.mock.calls[0][0].input;
    expect(first.RequestItems.answers).toHaveLength(25);
    expect(first.RequestItems.answers[0]).toEqual({ PutRequest: { Item: { id: '0' } } });
    expect(send.mock.calls[1][0].input.RequestItems.answers).toHaveLength(5);
  });

  it('does nothing for an empty list', async () => {
    await batchPut('answers', []);
    expect(send).not.toHaveBeenCalled();
  });
});
