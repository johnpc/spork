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
import { SkeletonRows } from '../shell/SkeletonRows';
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
        {s.isLoading ? (
          <SkeletonRows count={1} label="Loading study session" />
        ) : s.current && s.choices ? (
          <>
            <div className="study__bar">
              <span className="sp-muted study__progress" data-testid="study-progress">
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
            {s.canReviewAll && (
              <button
                type="button"
                className="empty-state__cta"
                data-testid="study-review-all"
                onClick={s.reviewAll}
              >
                Review all cards
              </button>
            )}
            <Link to={`/decks/${id}`} className="empty-state__cta study__back-link">
              Back to deck
            </Link>
          </EmptyState>
        )}
      </IonContent>
    </IonPage>
  );
}
