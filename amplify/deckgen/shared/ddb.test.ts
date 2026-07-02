import { describe, it, expect, vi, beforeEach } from 'vitest';

const send = vi.hoisted(() => vi.fn());
vi.mock('@aws-sdk/client-dynamodb', () => ({ DynamoDBClient: vi.fn() }));
vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: { from: () => ({ send }) },
  PutCommand: vi.fn((input) => ({ kind: 'put', input })),
  UpdateCommand: vi.fn((input) => ({ kind: 'update', input })),
  GetCommand: vi.fn((input) => ({ kind: 'get', input })),
}));

import { putItem, updateItem, getItem } from './ddb';

describe('ddb edges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    send.mockResolvedValue({});
  });

  it('putItem sends a PutCommand with the item', async () => {
    await putItem('t', { id: 'x', front: 'Hola' });
    expect(send.mock.calls[0][0].input).toEqual({
      TableName: 't',
      Item: { id: 'x', front: 'Hola' },
    });
  });

  it('updateItem builds a SET expression from the fields', async () => {
    await updateItem('t', 'x', { status: 'DRAFT_READY', generatedCount: 3 });
    const cmd = send.mock.calls[0][0].input;
    expect(cmd.Key).toEqual({ id: 'x' });
    expect(cmd.UpdateExpression).toBe('SET #status = :status, #generatedCount = :generatedCount');
    expect(cmd.ExpressionAttributeValues).toEqual({
      ':status': 'DRAFT_READY',
      ':generatedCount': 3,
    });
  });

  it('skips undefined fields (DynamoDB rejects undefined values)', async () => {
    await updateItem('t', 'x', { cardCount: 3, coverImagePath: undefined });
    const cmd = send.mock.calls[0][0].input;
    expect(cmd.UpdateExpression).toBe('SET #cardCount = :cardCount');
    expect(cmd.ExpressionAttributeValues).toEqual({ ':cardCount': 3 });
  });

  it('no-ops when every field is undefined', async () => {
    await updateItem('t', 'x', { coverImagePath: undefined });
    expect(send).not.toHaveBeenCalled();
  });

  it('getItem returns the item or null', async () => {
    send.mockResolvedValueOnce({ Item: { id: 'x' } });
    expect(await getItem('t', 'x')).toEqual({ id: 'x' });
    send.mockResolvedValueOnce({});
    expect(await getItem('t', 'y')).toBeNull();
  });
});
