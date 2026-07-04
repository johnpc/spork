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
import { useConnectionsList } from './useConnectionsList';
import { LoadState } from '../../../features/shell/LoadState';
import './connectionsList.css';

/** Connections home: the list of published puzzles, each linking into play. */
export function ConnectionsList() {
  const { puzzles, isLoading, isError, refetch } = useConnectionsList();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Connections</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState
          isLoading={isLoading}
          isError={isError}
          isEmpty={puzzles.length === 0}
          emptyTitle="No puzzles yet"
          onRetry={refetch}
        >
          <ul className="connections-list" data-testid="connections-list">
            {puzzles.map((p) => (
              <li key={p.id} className="connections-list__item">
                <Link
                  className="connections-list__link"
                  to={`/connections/${p.id}`}
                  data-testid="connections-link"
                >
                  Connections #{p.id.slice(0, 8)}
                </Link>
              </li>
            ))}
          </ul>
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
