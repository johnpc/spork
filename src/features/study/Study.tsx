import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useStudy } from './useStudy';
import { StudyCard } from './StudyCard';
import { StudyDone } from './StudyDone';
import { LoadState } from '../shell/LoadState';
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
        {/* Loading + a retryable error gate; the "session complete" state below
            is a legitimate end state, not a failed load, so it stays as content. */}
        <LoadState
          isLoading={s.isLoading}
          isError={s.isError}
          onRetry={s.retry}
          skeleton={<SkeletonRows count={1} label="Loading study session" />}
        >
          {s.current && s.choices ? (
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
            <StudyDone
              deckId={id}
              score={s.score}
              canReviewAll={s.canReviewAll}
              onReviewAll={s.reviewAll}
            />
          )}
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
