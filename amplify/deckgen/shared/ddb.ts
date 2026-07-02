/**
 * DynamoDB edges for the deck-gen worker. The worker writes straight to the
 * Amplify-managed tables via its IAM role (bypassing AppSync, like stoop's
 * ingestion) — so it sets the Amplify metadata (__typename, timestamps) itself.
 * Table names are injected by backend.ts. Mocked in the worker test.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/** Put a fully-formed item (caller supplies id/__typename/timestamps). */
export async function putItem(table: string, item: Record<string, unknown>): Promise<void> {
  await doc.send(new PutCommand({ TableName: table, Item: item }));
}

/** Get an item by id (GetItem — no GSI coupling). Returns null if absent. */
export async function getItem(table: string, id: string): Promise<Record<string, unknown> | null> {
  const res = await doc.send(new GetCommand({ TableName: table, Key: { id } }));
  return res.Item ?? null;
}

/** Set named attributes on an item by id (SET expression built from `fields`).
 * Undefined values are skipped — DynamoDB rejects an undefined attribute value,
 * so an optional field (e.g. a cover that failed to generate) is simply omitted
 * rather than failing the whole update. */
export async function updateItem(
  table: string,
  id: string,
  fields: Record<string, unknown>,
): Promise<void> {
  const keys = Object.keys(fields).filter((k) => fields[k] !== undefined);
  if (keys.length === 0) return;
  const names = Object.fromEntries(keys.map((k) => [`#${k}`, k]));
  const values = Object.fromEntries(keys.map((k) => [`:${k}`, fields[k]]));
  await doc.send(
    new UpdateCommand({
      TableName: table,
      Key: { id },
      UpdateExpression: `SET ${keys.map((k) => `#${k} = :${k}`).join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    }),
  );
}
