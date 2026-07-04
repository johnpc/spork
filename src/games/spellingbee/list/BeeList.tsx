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
import { useBees } from './useBees';
import { LoadState } from '../../../features/shell/LoadState';
import './beeList.css';

/** Spelling Bee home: list of published puzzles, each linking into play. */
export function BeeList() {
  const { bees, isLoading, isError, refetch } = useBees();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Spelling Bee</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState
          isLoading={isLoading}
          isError={isError}
          isEmpty={bees.length === 0}
          emptyTitle="No puzzles yet"
          onRetry={refetch}
        >
          <ul className="bee-list" data-testid="bee-list">
            {bees.map((b) => (
              <li key={b.id} className="bee-list__item">
                <Link className="bee-list__link" to={`/spellingbee/${b.id}`} data-testid="bee-link">
                  <span className="bee-list__letters">
                    {b.letters.toUpperCase()} · {b.centerLetter.toUpperCase()}
                  </span>
                  <span className="sp-muted bee-list__meta">{b.puzzleDate ?? 'No date'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
