import { useMemo } from 'react';
import type { RendererProps } from './renderers';
import { buildTiles } from './pictureTiles';
import './pictureBox.css';

/** True when a prompt value is an image URL (vs. an emoji/text placeholder). */
const isUrl = (v: string) => /^(https?:)?\/\//.test(v) || v.startsWith('data:');

/**
 * PICTURE_BOX renderer — identify people/things from images by typing. A grid
 * of image tiles (each answer's promptValue is an image URL or emoji
 * placeholder); typing a correct name reveals that tile's label. PICTURE_BOX is
 * a TYPED-input mode, so this renderer ignores `attempt` and just projects the
 * engine's found set (ANSWER IDS) onto the tiles — the shared PlayInput handles
 * the guessing.
 */
export function PictureBox({ answers, found }: RendererProps) {
  const tiles = useMemo(() => buildTiles(answers, found), [answers, found]);
  return (
    <div className="picture-box" data-testid="picture-box">
      {tiles.map((t) => (
        <div
          key={t.id}
          data-testid={t.found ? 'picture-box-found' : 'picture-box-tile'}
          className={t.found ? 'picture-box__tile picture-box__tile--found' : 'picture-box__tile'}
        >
          {isUrl(t.image) ? (
            <img className="picture-box__image" src={t.image} alt={t.found ? t.label : ''} />
          ) : (
            <span className="picture-box__image" role="img" aria-hidden="true">
              {t.image}
            </span>
          )}
          <span
            className={
              t.found ? 'picture-box__label' : 'picture-box__label picture-box__label--hidden'
            }
          >
            {t.found ? t.label : '???'}
          </span>
        </div>
      ))}
    </div>
  );
}
