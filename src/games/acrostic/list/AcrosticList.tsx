import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Link } from 'react-router-dom';
import { useAcrostics } from './useAcrostics';
import './acrosticList.css';

/** Acrostic home: the list of published puzzles, each linking into play. */
export function AcrosticList() {
  const { acrostics, isLoading } = useAcrostics();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Acrostic</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading ? (
          <p className="sp-muted">Loading…</p>
        ) : acrostics.length === 0 ? (
          <p className="sp-muted" data-testid="acrostics-empty">
            No acrostics yet.
          </p>
        ) : (
          <ul className="acrostic-list" data-testid="acrostic-list">
            {acrostics.map((a) => (
              <li key={a.id} className="acrostic-list__item">
                <Link
                  className="acrostic-list__link"
                  to={`/acrostic/${a.id}`}
                  data-testid="acrostic-link"
                >
                  <span className="acrostic-list__title">{a.title}</span>
                  <span className="sp-muted acrostic-list__meta">{a.difficulty}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </IonContent>
    </IonPage>
  );
}
