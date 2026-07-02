/**
 * Downscale + re-encode generated art to a small WebP. Stability returns a
 * ~1024px image and can't be asked for less; card/cover art renders small, so
 * we shrink to keep S3 objects ~10–25KB. Isolated edge (sharp is native);
 * mocked in tests. `fit: inside` never upscales and preserves aspect ratio.
 */
import sharp from 'sharp';

export const CARD_IMAGE_SIZE = 512;
export const COVER_IMAGE_SIZE = 640;

/** Resize raw image bytes to a max square `size`, returning WebP bytes. */
export async function resizeWebp(bytes: Uint8Array, size: number): Promise<Uint8Array> {
  const out = await sharp(Buffer.from(bytes))
    .resize(size, size, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
  return new Uint8Array(out);
}
