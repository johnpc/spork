/**
 * Produce one PICTURE_BOX answer's image: Bedrock Stability draws it, sharp
 * shrinks it to a small WebP, S3 stores it under the quiz's media prefix. Thin
 * orchestration over isolated edges (all mocked in the handler test). Returns
 * the stored S3 key. Reuses the deckgen media edges (generateImage/resizeWebp/
 * putMedia) — the same pipeline flashstack decks use.
 */
import { generateImage } from '../../deckgen/shared/bedrock';
import { resizeWebp, CARD_IMAGE_SIZE } from '../../deckgen/shared/resizeImage';
import { putMedia } from '../../deckgen/shared/s3';
import { answerImageKey } from '../shared/mediaKeys';

export interface ImageCtx {
  bucket: string;
  quizId: string;
}

/** Draw → resize → store one answer's image; return its S3 key. */
export async function produceAnswerImage(
  ctx: ImageCtx,
  answerId: string,
  imagePrompt: string,
): Promise<string> {
  const raw = await generateImage(
    `${imagePrompt}. Flat vector style, soft colors, centered subject, no text, no words.`,
  );
  const webp = await resizeWebp(raw, CARD_IMAGE_SIZE);
  const key = answerImageKey(ctx.quizId, answerId);
  await putMedia(ctx.bucket, key, webp, 'image/webp');
  return key;
}
