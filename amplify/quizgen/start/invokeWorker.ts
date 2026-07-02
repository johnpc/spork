/**
 * Async (Event) invoke of the quiz-gen worker — the starter fires this for
 * generative modes and returns immediately. Isolated edge; mocked in the handler
 * test. WORKER_FUNCTION_NAME is injected by backend.ts.
 */
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import type { QuizWorkerEvent } from '../worker/handler';

const client = new LambdaClient({});

/** Fire-and-forget invoke the worker with the generation job. */
export async function invokeWorker(functionName: string, event: QuizWorkerEvent): Promise<void> {
  await client.send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: 'Event', // async — don't wait for the long job
      Payload: Buffer.from(JSON.stringify(event)),
    }),
  );
}
