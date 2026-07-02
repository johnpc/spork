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
import { useLadders } from './useLadders';
import './ladderList.css';

/** Steps home: the list of published word ladders, each linking into play. */
export function LadderList() {
  const { ladders, isLoading } = useLadders();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Steps</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading ? (
          <p className="sp-muted">Loading…</p>
        ) : ladders.length === 0 ? (
          <p className="sp-muted" data-testid="ladders-empty">
            No word ladders yet.
          </p>
        ) : (
          <ul className="ladder-list" data-testid="ladder-list">
            {ladders.map((l) => (
              <li key={l.id} className="ladder-list__item">
                <Link className="ladder-list__link" to={`/steps/${l.id}`} data-testid="ladder-link">
                  <span className="ladder-list__pair">
                    {l.start.toUpperCase()} → {l.target.toUpperCase()}
                  </span>
                  <span className="sp-muted ladder-list__meta">{l.difficulty}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </IonContent>
    </IonPage>
  );
}
