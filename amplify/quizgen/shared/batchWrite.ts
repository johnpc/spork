/**
 * DynamoDB batch-write edge for the quizgen starter. Writes many fully-formed
 * items (caller supplies id/__typename/timestamps, like deckgen's ddb.putItem)
 * in BatchWriteItem chunks of 25 — the API's per-call cap. Isolated edge, mocked
 * in the handler test. Table name injected by backend.ts.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const MAX_BATCH = 25;

/** Split into chunks of at most `size` — pure, exported for the test. */
export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** BatchWrite every item to `table`, 25 per request. */
export async function batchPut(table: string, items: Record<string, unknown>[]): Promise<void> {
  for (const group of chunk(items, MAX_BATCH)) {
    await doc.send(
      new BatchWriteCommand({
        RequestItems: { [table]: group.map((Item) => ({ PutRequest: { Item } })) },
      }),
    );
  }
}
