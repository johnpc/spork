import { useMemo } from 'react';
import type { RendererProps } from './renderers';
import { buildTiles } from './pictureTiles';
import { PictureBoxTile } from './PictureBoxTile';
import './pictureBox.css';

/**
 * PICTURE_BOX renderer — identify people/things from images by typing. A grid of
 * image tiles (each answer's promptValue is an image URL, an S3 media key, or an
 * emoji placeholder); typing a correct name reveals that tile's label.
 * PICTURE_BOX is a TYPED-input mode, so this renderer ignores `attempt` and just
 * projects the engine's found set (ANSWER IDS) onto the tiles — the shared
 * PlayInput handles the guessing. Each tile resolves its own image source.
 */
export function PictureBox({ answers, found }: RendererProps) {
  const tiles = useMemo(() => buildTiles(answers, found), [answers, found]);
  return (
    <div className="picture-box" data-testid="picture-box">
      {tiles.map((t) => (
        <PictureBoxTile key={t.id} tile={t} />
      ))}
    </div>
  );
}
