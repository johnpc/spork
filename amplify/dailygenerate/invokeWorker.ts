/**
 * Async (Event) invoke of the daily-generate worker — the starter fires this and
 * returns immediately, so the long generation runs unbound by the AppSync
 * resolver window. The worker's function name is injected by backend.ts as
 * WORKER_FUNCTION_NAME. Isolated edge; mocked in the handler test.
 */
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const client = new LambdaClient({});

/** Fire-and-forget invoke the worker to generate the day for `date`. */
export async function invokeWorker(functionName: string, date: string): Promise<void> {
  await client.send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: 'Event', // async — don't wait for the long job
      Payload: Buffer.from(JSON.stringify({ puzzleDate: date })),
    }),
  );
}
