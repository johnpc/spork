/**
 * Produce one card: generate its image (Bedrock) + audio (Polly) to S3 in
 * parallel, then write the Card row. Media failures are non-fatal — a card is
 * still usable without an image/audio — so each is caught independently and the
 * card is written with whatever succeeded.
 */
import { generateImage } from '../shared/bedrock';
import { synthesizeSpeech } from '../shared/polly';
import { putMedia } from '../shared/s3';
import { resizeWebp, CARD_IMAGE_SIZE } from '../shared/resizeImage';
import { cardImageKey, cardAudioKey, imagePrompt } from '../shared/mediaKeys';
import { buildCardItem } from '../shared/cardItem';
import { putItem } from '../shared/ddb';
import type { GeneratedCard } from '../shared/parseCards';
import type { Voice } from '../shared/voiceForLanguage';

export interface ProduceCardCtx {
  bucket: string;
  cardTable: string;
  deckId: string;
  topic: string;
  voice: Voice;
  now: string;
}

async function makeImage(
  ctx: ProduceCardCtx,
  cardId: string,
  front: string,
): Promise<string | undefined> {
  try {
    const raw = await generateImage(imagePrompt(front, ctx.topic));
    const bytes = await resizeWebp(raw, CARD_IMAGE_SIZE);
    return putMedia(ctx.bucket, cardImageKey(ctx.deckId, cardId), bytes, 'image/webp');
  } catch {
    return undefined; // non-fatal: card renders without an image
  }
}

async function makeAudio(
  ctx: ProduceCardCtx,
  cardId: string,
  front: string,
): Promise<string | undefined> {
  try {
    const bytes = await synthesizeSpeech(front, ctx.voice);
    return putMedia(ctx.bucket, cardAudioKey(ctx.deckId, cardId), bytes, 'audio/mpeg');
  } catch {
    return undefined; // non-fatal: card renders without audio
  }
}

/** Generate media for one card and write its row; returns the new card id. */
export async function produceCard(
  ctx: ProduceCardCtx,
  cardId: string,
  ord: number,
  card: GeneratedCard,
): Promise<string> {
  const [imagePath, audioPath] = await Promise.all([
    makeImage(ctx, cardId, card.front),
    makeAudio(ctx, cardId, card.front),
  ]);
  await putItem(
    ctx.cardTable,
    buildCardItem({
      id: cardId,
      deckId: ctx.deckId,
      ord,
      now: ctx.now,
      card,
      imagePath,
      audioPath,
    }),
  );
  return cardId;
}
