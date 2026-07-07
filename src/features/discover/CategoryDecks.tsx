import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useDecks } from './useDecks';
import { DeckCard } from './DeckCard';
import { SkeletonRows } from '../shell/SkeletonRows';
import './discover.css';

/** A category's published decks, in a grid. Renders only. */
export function CategoryDecks() {
  const { slug } = useParams<{ slug: string }>();
  const { data: decks, isLoading } = useDecks(slug);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/discover" />
          </IonButtons>
          <IonTitle>Decks</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading ? (
          <SkeletonRows label="Loading decks" />
        ) : decks && decks.length > 0 ? (
          <div className="deck-grid">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        ) : (
          <p className="sp-muted" data-testid="empty-decks">
            No decks here yet — check back soon.
          </p>
        )}
      </IonContent>
    </IonPage>
  );
}
