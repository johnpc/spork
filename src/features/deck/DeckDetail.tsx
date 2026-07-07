import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Link, useParams } from 'react-router-dom';
import { useDeckDetail } from './useDeckDetail';
import { SaveDeckButton } from '../mydecks/SaveDeckButton';
import { SkeletonRows } from '../shell/SkeletonRows';
import './deck.css';

/** Deck detail: title, description, a prominent Study CTA, a Save-to-My-Decks
 * toggle (a guest who taps it is routed to sign-in), and a card preview. Study
 * itself is guest-playable and begins the session immediately. */
export function DeckDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useDeckDetail(id);
  const deck = data?.deck;
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/discover" />
          </IonButtons>
          <IonTitle>Deck</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading ? (
          <SkeletonRows count={3} label="Loading deck" />
        ) : !deck ? (
          <p className="sp-muted">Deck not found.</p>
        ) : (
          <div className="deck">
            <h1 className="sp-heading deck__title" data-testid="deck-title">
              {deck.topic}
            </h1>
            {deck.description && <p className="sp-muted">{deck.description}</p>}
            <div className="deck__actions">
              <Link to={`/decks/${deck.id}/study`} className="deck__study" data-testid="study-link">
                Study {deck.cardCount ?? 0} cards
              </Link>
              <SaveDeckButton
                deck={{
                  deckId: deck.id,
                  topic: deck.topic,
                  categorySlug: deck.categorySlug,
                  cardCount: deck.cardCount,
                  coverImagePath: deck.coverImagePath,
                }}
              />
            </div>
            <ul className="deck__cards" aria-label="Cards">
              {(data?.cards ?? []).map((card) => (
                <li key={card.id} className="deck__card-row" data-testid="card-row">
                  <span className="sp-card-face">{card.front}</span>
                  <span className="sp-muted">{card.back}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
