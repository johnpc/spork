/**
 * The daily-ingestion Lambda: EventBridge fires it once a day to generate one
 * fresh PUBLISHED puzzle per generative game type (Amplify provisions the
 * schedule rule from `schedule`). Long timeout + more memory because it makes
 * several Bedrock calls in sequence. backend.ts grants Bedrock + the game-table
 * writes. Runs in the data resource group (it writes the data tables).
 */
import { defineFunction } from '@aws-amplify/backend';

export const dailyIngest = defineFunction({
  name: 'daily-ingest',
  entry: './handler.ts',
  schedule: 'every day',
  timeoutSeconds: 600, // several sequential Bedrock generations
  memoryMB: 1024,
});
