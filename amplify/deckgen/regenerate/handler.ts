/**
 * regenerateCardMedia resolver. Reads the card by id (GetItem — no GSI
 * coupling), regenerates its image OR audio (kind), overwrites the same S3 key,
 * updates the Card row, and returns the path. Synchronous (one Bedrock/Polly
 * call) — fits the resolver timeout. Thin: pure key/prompt + isolated edges.
 */
import { generateImage } from '../shared/bedrock';
import { synthesizeSpeech } from '../shared/polly';
import { putMedia } from '../shared/s3';
import { resizeWebp, CARD_IMAGE_SIZE } from '../shared/resizeImage';
import { cardImageKey, cardAudioKey, imagePrompt } from '../shared/mediaKeys';
import { voiceForLanguage } from '../shared/voiceForLanguage';
import { getItem, updateItem } from '../shared/ddb';
import type { Schema } from '../../data/resource';

type Args = Schema['regenerateCardMedia']['args'];

const env = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
};

export const handler: Schema['regenerateCardMedia']['functionHandler'] = async (event) => {
  const { cardId, kind } = event.arguments as Args;
  const cardTable = env('CARD_TABLE');
  const card = await getItem(cardTable, cardId);
  if (!card) throw new Error('card not found');
  const deckId = String(card.deckId);
  const front = String(card.front);

  let path: string;
  if (kind === 'image') {
    const deck = await getItem(env('DECK_TABLE'), deckId);
    const raw = await generateImage(imagePrompt(front, String(deck?.topic ?? '')));
    const bytes = await resizeWebp(raw, CARD_IMAGE_SIZE);
    path = await putMedia(env('MEDIA_BUCKET'), cardImageKey(deckId, cardId), bytes, 'image/webp');
    await updateItem(cardTable, cardId, { imagePath: path, updatedAt: new Date().toISOString() });
  } else if (kind === 'audio') {
    const deck = await getItem(env('DECK_TABLE'), deckId);
    const voice = voiceForLanguage(deck?.voiceLanguage as string | undefined);
    const bytes = await synthesizeSpeech(front, voice);
    path = await putMedia(env('MEDIA_BUCKET'), cardAudioKey(deckId, cardId), bytes, 'audio/mpeg');
    await updateItem(cardTable, cardId, { audioPath: path, updatedAt: new Date().toISOString() });
  } else {
    throw new Error(`unknown media kind: ${kind}`);
  }
  return { path };
};
