/**
 * The generateDeck starter Lambda (custom-mutation resolver). Creates the
 * GenerationRun + a DRAFT Deck, async-invokes the worker, and returns
 * { runId, deckId } immediately — so it stays well under the AppSync resolver
 * timeout. backend.ts grants it the worker invoke + table writes.
 */
import { defineFunction } from '@aws-amplify/backend';

export const generateDeckStarter = defineFunction({
  name: 'deckgen-start',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  // This is a custom-mutation resolver; assigning it to the data stack avoids
  // the data<->function nested-stack circular dependency CloudFormation rejects.
  resourceGroupName: 'data',
});
