import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { layersOutline } from 'ionicons/icons';
import { useMediaUrl } from '../../lib/useMediaUrl';
import type { DeckCardData } from './composeDecks';

/** A deck tile in a category grid: cover image, topic, and card count. */
export function DeckCard({ deck }: { deck: DeckCardData }) {
  const coverUrl = useMediaUrl(deck.coverImagePath);
  return (
    <Link to={`/decks/${deck.id}`} className="deck-card" data-testid="deck-card">
      <div className="deck-card__cover">
        {coverUrl ? (
          <img className="deck-card__img" src={coverUrl} alt="" />
        ) : (
          <div className="deck-card__placeholder" aria-hidden="true">
            <IonIcon icon={layersOutline} />
          </div>
        )}
      </div>
      <h3 className="deck-card__topic fs-heading">{deck.topic}</h3>
      <p className="deck-card__count fs-muted">{deck.cardCount} cards</p>
    </Link>
  );
}
