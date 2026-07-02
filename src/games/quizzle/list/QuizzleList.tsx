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
import { useQuizzleList } from './useQuizzleList';
import './quizzleList.css';

/** Quizzle home: the list of published wager quizzes, each linking into play. */
export function QuizzleList() {
  const { quizzles, isLoading } = useQuizzleList();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Quizzle</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading ? (
          <p className="sp-muted">Loading…</p>
        ) : quizzles.length === 0 ? (
          <p className="sp-muted" data-testid="quizzles-empty">
            No quizzles yet.
          </p>
        ) : (
          <ul className="quizzle-list" data-testid="quizzle-list">
            {quizzles.map((q) => (
              <li key={q.id} className="quizzle-list__item">
                <Link
                  className="quizzle-list__link"
                  to={`/quizzle/${q.id}`}
                  data-testid="quizzle-link"
                >
                  <span className="quizzle-list__topic">{q.topic}</span>
                  <span className="sp-muted quizzle-list__meta">Bank {q.startingBank ?? 1000}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </IonContent>
    </IonPage>
  );
}
