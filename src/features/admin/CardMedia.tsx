import { IonIcon } from '@ionic/react';
import { imageOutline } from 'ionicons/icons';
import { useMediaUrl } from '../../lib/useMediaUrl';
import { AudioButton } from '../shell/AudioButton';

/** Image preview + audio player for a card in the editor. Resolves S3 keys to
 * URLs; shows a placeholder when a card has no image/audio yet. */
export function CardMedia({
  imagePath,
  audioPath,
}: {
  imagePath?: string | null;
  audioPath?: string | null;
}) {
  const imageUrl = useMediaUrl(imagePath);
  return (
    <div className="card-media" data-testid="card-media">
      {imageUrl ? (
        <img className="card-media__img" src={imageUrl} alt="" data-testid="card-media-img" />
      ) : (
        <div className="card-media__img card-media__img--empty" aria-hidden="true">
          <IonIcon icon={imageOutline} />
        </div>
      )}
      <AudioButton audioPath={audioPath} />
    </div>
  );
}
