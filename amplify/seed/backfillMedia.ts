/**
 * One-off maintenance: backfill decks generated before the resize change, whose
 * images are full-size multi-MB PNGs. For each deck cover + card image still on
 * a `.png` key, download it, resize→WebP (the same transform the pipeline now
 * does), upload to the new `.webp` key, and update the DB record's path. Runs
 * locally (uses the darwin sharp build — no Lambda layer needed).
 *
 *   npm run prod-config        # point amplify_outputs.json at the target backend
 *   npm run backfill:media
 *
 * Idempotent: a record already on a `.webp` path is skipped.
 */
import { signIn, signOut } from 'aws-amplify/auth';
import { getUrl, uploadData } from 'aws-amplify/storage';
import { client, EDITOR_WRITE } from './seedClient';
import { resizeWebp, CARD_IMAGE_SIZE, COVER_IMAGE_SIZE } from '../deckgen/shared/resizeImage';

const toWebpKey = (key: string) => key.replace(/\.(png|jpe?g)$/i, '.webp');

/** Download an S3 object by key, resize to WebP, upload to its .webp key. */
async function convert(key: string, size: number): Promise<string> {
  const { url } = await getUrl({ path: key });
  const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
  const webp = await resizeWebp(bytes, size);
  const newKey = toWebpKey(key);
  await uploadData({ path: newKey, data: webp, options: { contentType: 'image/webp' } }).result;
  return newKey;
}

async function main() {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;
  if (!username || !password) throw new Error('TEST_USERNAME / TEST_PASSWORD required (editor).');
  await signOut().catch(() => {});
  await signIn({ username, password });

  let covers = 0;
  let cards = 0;
  const { data: decks } = await client.models.Deck.list({ limit: 1000, ...EDITOR_WRITE });
  for (const deck of decks ?? []) {
    if (deck.coverImagePath && !deck.coverImagePath.endsWith('.webp')) {
      const key = await convert(deck.coverImagePath, COVER_IMAGE_SIZE);
      await client.models.Deck.update({ id: deck.id, coverImagePath: key }, EDITOR_WRITE);
      covers++;
    }
    const { data: deckCards } = await client.models.Card.listCardByDeckIdAndOrd(
      { deckId: deck.id },
      { limit: 1000, ...EDITOR_WRITE },
    );
    for (const card of deckCards ?? []) {
      if (card.imagePath && !card.imagePath.endsWith('.webp')) {
        const key = await convert(card.imagePath, CARD_IMAGE_SIZE);
        await client.models.Card.update({ id: card.id, imagePath: key }, EDITOR_WRITE);
        cards++;
        console.log(`  card ${card.id} → ${key}`);
      }
    }
  }
  await signOut().catch(() => {});
  console.log(`Backfill complete: ${covers} covers, ${cards} card images converted.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
