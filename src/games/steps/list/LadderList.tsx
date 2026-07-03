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
import { LoadState } from '../../../features/shell/LoadState';
import './ladderList.css';

/** Steps home: the list of published word ladders, each linking into play. */
export function LadderList() {
  const { ladders, isLoading, isError, refetch } = useLadders();
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
        <LoadState
          isLoading={isLoading}
          isError={isError}
          isEmpty={ladders.length === 0}
          emptyTitle="No word ladders yet"
          onRetry={refetch}
        >
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
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
