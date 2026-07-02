/**
 * Deck-gen worker (async-invoked by the starter). Generates the cards with
 * Claude, produces per-card image+audio to S3 (bounded concurrency) and writes
 * each Card row, then flips the Deck + GenerationRun to DRAFT_READY. Any failure
 * marks the run FAILED so the dashboard shows it. Thin: logic is in pure
 * helpers (prompt/parse/voice/keys) + isolated edges (bedrock/polly/s3/ddb).
 */
import { randomUUID } from 'node:crypto';
import { invokeText } from '../shared/bedrock';
import { buildCardsRequest } from '../shared/cardsPrompt';
import { parseCards } from '../shared/parseCards';
import { voiceForLanguage } from '../shared/voiceForLanguage';
import { updateItem } from '../shared/ddb';
import { produceCard, type ProduceCardCtx } from './produceCard';
import { produceCover } from './produceCover';
import { mapLimit } from './mapLimit';
import type { WorkerEvent } from '../start/invokeWorker';

const MEDIA_CONCURRENCY = 4;

const env = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
};

export async function handler(event: WorkerEvent): Promise<void> {
  const runTable = env('GENERATION_RUN_TABLE');
  const deckTable = env('DECK_TABLE');
  try {
    const body = await invokeText(
      buildCardsRequest({
        topic: event.topic,
        cardCount: event.cardCount,
        frontLanguage: event.voiceLanguage,
      }),
    );
    const cards = parseCards(body as Parameters<typeof parseCards>[0]);
    const now = new Date().toISOString();
    const ctx: ProduceCardCtx = {
      bucket: env('MEDIA_BUCKET'),
      cardTable: env('CARD_TABLE'),
      deckId: event.deckId,
      topic: event.topic,
      voice: voiceForLanguage(event.voiceLanguage),
      now,
    };

    // Cover (one per deck) runs alongside the per-card media fan-out.
    const [coverPath] = await Promise.all([
      produceCover(ctx.bucket, event.deckId, event.topic),
      mapLimit(cards, MEDIA_CONCURRENCY, (card, i) => produceCard(ctx, randomUUID(), i, card)),
    ]);

    await updateItem(deckTable, event.deckId, {
      cardCount: cards.length,
      coverImagePath: coverPath,
      updatedAt: now,
    });
    await updateItem(runTable, event.runId, {
      status: 'DRAFT_READY',
      generatedCount: cards.length,
      updatedAt: now,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'generation failed';
    await updateItem(runTable, event.runId, {
      status: 'FAILED',
      statusReason: reason,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
    throw err;
  }
}
