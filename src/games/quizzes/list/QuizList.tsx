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
import { useQuizzes } from './useQuizzes';
import { useIsEditor } from '../../../features/admin/useIsEditor';
import { LoadState } from '../../../features/shell/LoadState';
import './quizList.css';

/** Quizzes home: the list of published quizzes, each linking into play. */
export function QuizList() {
  const { quizzes, isLoading, isError, refetch } = useQuizzes();
  const { isEditor } = useIsEditor();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Quizzes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isEditor && (
          <Link to="/admin/quizzes" className="sp-kicker" data-testid="quiz-studio-link">
            Quiz Studio →
          </Link>
        )}
        <LoadState
          isLoading={isLoading}
          isError={isError}
          isEmpty={quizzes.length === 0}
          emptyTitle="No quizzes yet"
          onRetry={refetch}
        >
          <ul className="quiz-list" data-testid="quiz-list">
            {quizzes.map((q) => (
              <li key={q.id} className="quiz-list__item">
                <Link
                  className="quiz-list__link"
                  to={`/quizzes/${q.id}/play`}
                  data-testid="quiz-link"
                >
                  <span className="quiz-list__topic">{q.topic}</span>
                  <span className="sp-muted quiz-list__meta">
                    {q.mode} · {q.answerCount} answers
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
