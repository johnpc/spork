import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { Link } from 'react-router-dom';
import { useAdminDecks } from './useAdminDecks';
import { useGenerateDeck } from './useGenerateDeck';
import { NewDeckForm } from './NewDeckForm';
import { GenerateDeckForm } from './GenerateDeckForm';
import { GenerationRuns } from './GenerationRuns';
import { SkeletonRows } from '../shell/SkeletonRows';
import './admin.css';

/** Admin: list every deck (any status), create new ones, publish/delete. */
export function ManageDecks() {
  const { decks, isLoading, create, setPublished, remove } = useAdminDecks();
  const gen = useGenerateDeck();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/discover" />
          </IonButtons>
          <IonTitle>Manage decks</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <section className="admin-panel admin-panel--accent">
          <h2 className="admin-panel__title">✨ Generate with AI</h2>
          <p className="sp-muted admin-panel__hint">
            Describe a topic and Claude writes the cards, with images and audio.
          </p>
          <GenerateDeckForm onGenerate={gen.generate} />
          <GenerationRuns runs={gen.runs} />
        </section>

        <section className="admin-panel">
          <h2 className="admin-panel__title">Create a blank deck</h2>
          <NewDeckForm onCreate={create} />
        </section>

        <h2 className="admin-panel__title admin-decks__heading">All decks</h2>
        {isLoading ? (
          <SkeletonRows count={4} />
        ) : decks.length === 0 ? (
          <p className="sp-muted">No decks yet — generate or create one above.</p>
        ) : (
          <ul className="admin-decks" aria-label="All decks">
            {decks.map((d) => (
              <li key={d.id} className="admin-decks__row" data-testid="admin-deck">
                <div className="admin-decks__main">
                  <Link to={`/admin/decks/${d.id}`} className="admin-decks__topic sp-heading">
                    {d.topic}
                  </Link>
                  <span
                    className={`admin-badge admin-badge--${(d.status ?? 'DRAFT').toLowerCase()}`}
                    data-testid="deck-status"
                  >
                    {d.status}
                  </span>
                </div>
                <div className="admin-decks__actions">
                  <button
                    type="button"
                    onClick={() => setPublished({ id: d.id, published: d.status !== 'PUBLISHED' })}
                  >
                    {d.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button type="button" className="admin-decks__del" onClick={() => remove(d.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </IonContent>
    </IonPage>
  );
}
