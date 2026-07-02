/**
 * The generateQuiz starter Lambda (custom-mutation resolver). Forks on `mode`:
 * template-backed modes (MAP) build the answer set from a shipped fixture and
 * write the Quiz + Answers + GenerationRun synchronously — no Bedrock, no worker
 * — well under the resolver timeout for a bounded answer set (~200 countries).
 * Generative modes (TYPING/…) will async-invoke a worker (not built this slice).
 * backend.ts grants it the Quiz/Answer/GenerationRun table writes.
 */
import { defineFunction } from '@aws-amplify/backend';

export const generateQuizStarter = defineFunction({
  name: 'quizgen-start',
  entry: './handler.ts',
  timeoutSeconds: 60, // batched writes of a bounded answer set
  memoryMB: 512,
  // Custom-mutation resolver → data stack (avoids the data<->function
  // nested-stack circular dependency CloudFormation rejects).
  resourceGroupName: 'data',
});
