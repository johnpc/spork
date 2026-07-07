/**
 * The on-demand daily-generation WORKER — async-invoked by the starter (the
 * generateDailyPuzzles resolver). Runs the long job: generate every game for the
 * requested date, skipping any already present (idempotent). Split from the
 * starter so the starter→worker invoke grant + the worker's table access don't
 * self-reference within the data stack (CloudFormation circular-dependency fix,
 * mirroring deckgen/quizgen). backend.ts grants Bedrock + game-table read/write.
 */
import { defineFunction } from '@aws-amplify/backend';

export const dailyGenerateWorker = defineFunction({
  name: 'daily-generate-worker',
  entry: './handler.ts',
  timeoutSeconds: 600, // a full day is ~7 Bedrock-backed games
  memoryMB: 1024,
  resourceGroupName: 'data',
});
