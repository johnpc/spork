/**
 * The generateDailyPuzzles STARTER Lambda (custom-mutation resolver) — the
 * guest-callable entry that backfills a full day's puzzles for a PAST date
 * (≤ today) on first visit. Thin + fast: it validates the date, async-invokes
 * the worker (which does the long generation), and returns { date, started }
 * immediately — well under the AppSync resolver window. The client polls the
 * puzzle tables by puzzleDate to detect completion. backend.ts grants it invoke
 * of the worker.
 */
import { defineFunction } from '@aws-amplify/backend';

export const dailyGenerateStarter = defineFunction({
  name: 'daily-generate-start',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  // Custom-mutation resolver → data stack (avoids the data<->function
  // nested-stack circular dependency CloudFormation rejects).
  resourceGroupName: 'data',
});
