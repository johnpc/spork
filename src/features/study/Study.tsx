import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { checkmarkDoneCircleOutline } from 'ionicons/icons';
import { Link, useParams } from 'react-router-dom';
import { useStudy } from './useStudy';
import { StudyCard } from './StudyCard';
import { EmptyState } from '../shell/EmptyState';
import './study.css';

/** Play screen: walk the deck's study queue, self-grading each card. */
export function Study() {
  const { id } = useParams<{ id: string }>();
  const s = useStudy(id);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/decks/${id}`} />
          </IonButtons>
          <IonTitle>Study</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {!s.isAuthenticated ? (
          <p className="fs-muted" data-testid="study-signed-out">
            <Link to="/signin">Sign in</Link> to study this deck.
          </p>
        ) : s.isLoading ? (
          <p className="fs-muted">Loading…</p>
        ) : s.current && s.choices ? (
          <>
            <div className="study__bar">
              <span className="fs-muted study__progress" data-testid="study-progress">
                {s.position.index + 1} / {s.position.total}
              </span>
              <button
                type="button"
                className="study__direction"
                data-testid="study-direction"
                onClick={s.toggleDirection}
              >
                {s.direction === 'front' ? 'Front → Back' : 'Back → Front'} ⇄
              </button>
            </div>
            <StudyCard
              card={s.current.card}
              choices={s.choices}
              direction={s.direction}
              picked={s.picked}
              onAnswer={s.answer}
              onNext={s.next}
            />
          </>
        ) : (
          <EmptyState
            icon={checkmarkDoneCircleOutline}
            title={s.score.total > 0 ? 'Session complete!' : 'All caught up!'}
            message={
              s.score.total > 0
                ? `You got ${s.score.correct} of ${s.score.total} correct.`
                : 'No cards are due right now. Come back later to keep your streak going.'
            }
            testId="study-done"
          >
            {s.score.total > 0 && (
              <p className="study__score" data-testid="study-score">
                {Math.round((s.score.correct / s.score.total) * 100)}%
              </p>
            )}
            <Link to={`/decks/${id}`} className="empty-state__cta">
              Back to deck
            </Link>
          </EmptyState>
        )}
      </IonContent>
    </IonPage>
  );
}
