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
import { useChessPuzzles } from './useChessPuzzles';
import { LoadState } from '../../../features/shell/LoadState';
import './chessList.css';

/** Chess Attack home: the list of published puzzles, each linking into play. */
export function ChessList() {
  const { puzzles, isLoading, isError, refetch } = useChessPuzzles();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Chess Attack</IonTitle>
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
          <ul className="chess-list" data-testid="chess-list">
            {puzzles.map((p) => (
              <li key={p.id} className="chess-list__item">
                <Link className="chess-list__link" to={`/chess/${p.id}`} data-testid="chess-link">
                  <span className="chess-list__name">{p.name}</span>
                  <span className="sp-muted chess-list__meta">{p.difficulty}</span>
                </Link>
              </li>
            ))}
          </ul>
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
