import { useMediaUrl } from '../../../lib/useMediaUrl';
import type { PictureTile } from './pictureTiles';

/** True when a value is already a full image URL (vs. an S3 key or emoji). */
const isUrl = (v: string) => /^(https?:)?\/\//.test(v) || v.startsWith('data:');
/** An emoji placeholder (short, no path separators) — not an image reference. */
const isEmoji = (v: string) => !isUrl(v) && !v.includes('/');

/**
 * One PICTURE_BOX tile. The prompt value is a full image URL (baked seed images),
 * an S3 media key (generative pipeline — resolved to a presigned URL here), or an
 * emoji placeholder. Reveals the label once the answer is found.
 */
export function PictureBoxTile({ tile }: { tile: PictureTile }) {
  // Resolve S3 keys to a presigned URL; skip for URLs/emoji (hook no-ops on null).
  const isImageKey = !isUrl(tile.image) && !isEmoji(tile.image);
  const resolved = useMediaUrl(isImageKey ? tile.image : null);
  const src = isUrl(tile.image) ? tile.image : resolved;

  return (
    <div
      data-testid={tile.found ? 'picture-box-found' : 'picture-box-tile'}
      className={tile.found ? 'picture-box__tile picture-box__tile--found' : 'picture-box__tile'}
    >
      {src ? (
        <img
          className="picture-box__image"
          src={src}
          alt={tile.found ? tile.label : 'Mystery image'}
        />
      ) : (
        <span
          className="picture-box__image picture-box__image--emoji"
          role="img"
          aria-hidden="true"
        >
          {isEmoji(tile.image) ? tile.image : '🖼️'}
        </span>
      )}
      <span
        className={
          tile.found ? 'picture-box__label' : 'picture-box__label picture-box__label--hidden'
        }
      >
        {tile.found ? tile.label : '???'}
      </span>
    </div>
  );
}
