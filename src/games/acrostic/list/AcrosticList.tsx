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
import { LoadState } from '../../../features/shell/LoadState';
import './acrosticList.css';

/** Acrostic home: the list of published puzzles, each linking into play. */
export function AcrosticList() {
  const { acrostics, isLoading, isError, refetch } = useAcrostics();
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
        <LoadState
          isLoading={isLoading}
          isError={isError}
          isEmpty={acrostics.length === 0}
          emptyTitle="No acrostics yet"
          onRetry={refetch}
        >
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
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
