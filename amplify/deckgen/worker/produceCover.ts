/**
 * Generate a deck cover image (Bedrock), shrink to WebP, store under the deck's
 * media prefix, and return the S3 key — or undefined on failure (a cover is
 * nice-to-have; a deck without one falls back to the branded placeholder).
 */
import { generateImage } from '../shared/bedrock';
import { putMedia } from '../shared/s3';
import { resizeWebp, COVER_IMAGE_SIZE } from '../shared/resizeImage';
import { deckCoverKey, coverPrompt } from '../shared/mediaKeys';

export async function produceCover(
  bucket: string,
  deckId: string,
  topic: string,
): Promise<string | undefined> {
  try {
    const raw = await generateImage(coverPrompt(topic));
    const bytes = await resizeWebp(raw, COVER_IMAGE_SIZE);
    return putMedia(bucket, deckCoverKey(deckId), bytes, 'image/webp');
  } catch (err) {
    // Non-fatal, but log the reason — a silently-missing cover is hard to debug.
    console.warn('cover generation failed:', err instanceof Error ? err.message : err);
    return undefined;
  }
}
