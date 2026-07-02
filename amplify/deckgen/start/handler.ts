/**
 * generateDeck resolver. Thin: mint ids/now, create the GenerationRun (RUNNING)
 * + a DRAFT Deck, async-invoke the worker, return { runId, deckId }. The long
 * generation runs in the worker so this stays under the resolver timeout.
 */
import { randomUUID } from 'node:crypto';
import { putItem } from '../shared/ddb';
import { invokeWorker } from './invokeWorker';
import type { Schema } from '../../data/resource';

type Args = Schema['generateDeck']['args'];

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} not set`);
  return value;
}

export const handler: Schema['generateDeck']['functionHandler'] = async (event) => {
  const { topic, categorySlug, cardCount, voiceLanguage } = event.arguments as Args;
  const runId = randomUUID();
  const deckId = randomUUID();
  const now = new Date().toISOString();

  await putItem(required('DECK_TABLE'), {
    id: deckId,
    __typename: 'Deck',
    createdAt: now,
    updatedAt: now,
    topic,
    categorySlug,
    voiceLanguage,
    status: 'DRAFT',
    cardCount: 0,
  });
  await putItem(required('GENERATION_RUN_TABLE'), {
    id: runId,
    __typename: 'GenerationRun',
    createdAt: now,
    updatedAt: now,
    topic,
    categorySlug,
    voiceLanguage,
    requestedCount: cardCount,
    generatedCount: 0,
    deckId,
    status: 'RUNNING',
    startedAt: now,
  });

  await invokeWorker(required('WORKER_FUNCTION_NAME'), {
    runId,
    deckId,
    topic,
    cardCount,
    voiceLanguage,
  });
  return { runId, deckId };
};
