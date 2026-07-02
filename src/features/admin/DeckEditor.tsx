import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useAdminCards } from './useAdminCards';
import { CardEditorRow } from './CardEditorRow';
import { AddCardForm } from './AddCardForm';
import './admin.css';

/** Admin: edit one deck's cards — add, edit, delete, reorder. */
export function DeckEditor() {
  const { id } = useParams<{ id: string }>();
  const { deck, cards, isLoading, add, edit, remove, move, regenerate } = useAdminCards(id);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/decks" />
          </IonButtons>
          <IonTitle>{deck?.topic ?? 'Edit deck'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading ? (
          <p className="fs-muted">Loading…</p>
        ) : (
          <>
            <AddCardForm onAdd={add} />
            <ul className="card-edit-list" aria-label="Cards">
              {cards.map((card) => (
                <CardEditorRow
                  key={card.id}
                  card={card}
                  onSave={(input) => edit({ id: card.id, input })}
                  onDelete={() => remove(card.id)}
                  onMove={(direction) => move({ id: card.id, direction })}
                  onRegenerate={(kind) => regenerate({ id: card.id, kind })}
                />
              ))}
            </ul>
            {cards.length === 0 && (
              <p className="fs-muted" data-testid="no-cards">
                No cards yet — add one above.
              </p>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
