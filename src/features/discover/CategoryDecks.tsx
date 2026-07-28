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
import { LoadState } from '../shell/LoadState';
import { SkeletonRows } from '../shell/SkeletonRows';
import './discover.css';

/** A category's published decks, in a grid. Renders only. A failed load surfaces
 * a retry (via LoadState) instead of a false "no decks here". */
export function CategoryDecks() {
  const { slug } = useParams<{ slug: string }>();
  const { data: decks, isLoading, isError, refetch } = useDecks(slug);
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
        <LoadState
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && (decks ?? []).length === 0}
          emptyTitle="No decks here yet"
          emptyMessage="Check back soon."
          onRetry={() => void refetch()}
          skeleton={<SkeletonRows label="Loading decks" />}
        >
          <div className="deck-grid">
            {(decks ?? []).map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
