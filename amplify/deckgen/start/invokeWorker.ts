/**
 * Async (Event) invoke of the worker Lambda — the starter fires this and
 * returns immediately. Isolated edge; mocked in the handler test. The worker's
 * function name is injected by backend.ts as WORKER_FUNCTION_NAME.
 */
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const client = new LambdaClient({});

export interface WorkerEvent {
  runId: string;
  deckId: string;
  topic: string;
  cardCount: number;
  voiceLanguage: string;
}

/** Fire-and-forget invoke the worker with the generation job. */
export async function invokeWorker(functionName: string, event: WorkerEvent): Promise<void> {
  await client.send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: 'Event', // async — don't wait for the long job
      Payload: Buffer.from(JSON.stringify(event)),
    }),
  );
}
