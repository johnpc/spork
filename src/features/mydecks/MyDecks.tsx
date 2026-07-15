import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { libraryOutline, compassOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import { useMyDecks } from './useMyDecks';
import { DueTodayPanel } from './DueTodayPanel';
import { TabBar } from '../shell/TabBar';
import { EmptyState } from '../shell/EmptyState';
import { LoadState } from '../shell/LoadState';
import { SkeletonRows } from '../shell/SkeletonRows';
import './mydecks.css';

/** "My Decks" — the signed-in user's saved decks. Renders only. A failed load
 * surfaces a retry (via LoadState) instead of a false "no saved decks yet". */
export function MyDecks() {
  const { decks, isLoading, isError, retry, isAuthenticated } = useMyDecks();
  const emptyDecks = (
    <EmptyState
      icon={compassOutline}
      title="No saved decks yet"
      message="Find a deck in Discover and add it to start studying."
      testId="empty-my-decks"
    >
      <Link to="/discover" className="empty-state__cta">
        Browse Discover
      </Link>
    </EmptyState>
  );
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Decks</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {!isAuthenticated ? (
          <EmptyState
            icon={libraryOutline}
            title="Your library awaits"
            message="Sign in to save decks and track your progress with spaced repetition."
            testId="signed-out"
          >
            <Link to="/signin" className="empty-state__cta">
              Sign in
            </Link>
          </EmptyState>
        ) : (
          <LoadState
            isLoading={isLoading}
            isError={isError}
            isEmpty={!isLoading && !isError && decks.length === 0}
            onRetry={retry}
            emptyState={emptyDecks}
            skeleton={<SkeletonRows label="Loading your decks" />}
          >
            <DueTodayPanel />
            <ul className="my-decks" aria-label="Saved decks">
              {decks.map((deck) => (
                <li key={deck.id} data-testid="my-deck">
                  <Link to={`/decks/${deck.deckId}`} className="my-decks__row">
                    <span className="sp-heading my-decks__topic">{deck.topic}</span>
                    <span className="my-decks__count">{deck.cardCount ?? 0} cards</span>
                  </Link>
                </li>
              ))}
            </ul>
          </LoadState>
        )}
        <TabBar active="My Decks" />
      </IonContent>
    </IonPage>
  );
}
