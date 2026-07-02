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
import { DeckMastery } from '../stats/DeckMastery';
import './deck.css';

/** Deck detail: title, description, Add-to-My-Decks, and a card preview list. */
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
        {isLoading || !deck ? (
          <p className="sp-muted">{isLoading ? 'Loading deck…' : 'Deck not found.'}</p>
        ) : (
          <>
            <h1 className="sp-heading deck__title" data-testid="deck-title">
              {deck.topic}
            </h1>
            {deck.description && <p className="sp-muted">{deck.description}</p>}
            <div className="deck__actions">
              <SaveDeckButton
                deck={{
                  deckId: deck.id,
                  topic: deck.topic,
                  categorySlug: deck.categorySlug,
                  cardCount: deck.cardCount,
                  coverImagePath: deck.coverImagePath,
                }}
              />
              <Link to={`/decks/${deck.id}/study`} className="deck__study" data-testid="study-link">
                Study
              </Link>
            </div>
            <DeckMastery deckId={deck.id} cardCount={deck.cardCount ?? 0} />
            <ul className="deck__cards" aria-label="Cards">
              {(data?.cards ?? []).map((card) => (
                <li key={card.id} className="deck__card-row" data-testid="card-row">
                  <span className="sp-card-face">{card.front}</span>
                  <span className="sp-muted">{card.back}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
