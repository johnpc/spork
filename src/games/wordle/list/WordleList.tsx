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
import { useWordles } from './useWordles';
import { LoadState } from '../../../features/shell/LoadState';
import './wordleList.css';

/** Wordle home: the list of published Wordle puzzles, each linking into play. */
export function WordleList() {
  const { puzzles, isLoading, isError, refetch } = useWordles();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Wordle</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState
          isLoading={isLoading}
          isError={isError}
          isEmpty={puzzles.length === 0}
          emptyTitle="No Wordle puzzles yet"
          onRetry={refetch}
        >
          <ul className="wordle-list" data-testid="wordle-list">
            {puzzles.map((p) => (
              <li key={p.id} className="wordle-list__item">
                <Link
                  className="wordle-list__link"
                  to={`/wordle/${p.id}`}
                  data-testid="wordle-link"
                >
                  <span className="wordle-list__date">{p.puzzleDate ?? 'Daily Puzzle'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
