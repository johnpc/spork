import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Redirect, useParams } from 'react-router-dom';
import { useQuizzle } from './useQuizzle';
import { QuizzleRound } from './QuizzleRound';
import { QuizzleDone } from './QuizzleDone';
import { useRecordDailyOnDone } from '../../shared/daily/useRecordDailyOnDone';
import { useElapsed } from '../../shared/daily/useElapsed';
import { useDailyGuard } from '../../shared/daily/useDailyGuard';
import { LoadState } from '../../../features/shell/LoadState';
import './quizzle.css';

/** Quizzle play screen: a pub-quiz where you WAGER against a bank each question.
 * Uses its OWN wager engine (useQuizzle) — no shared quiz machinery. */
export function Quizzle() {
  const { id } = useParams<{ id: string }>();
  const q = useQuizzle(id, window.localStorage);
  const done = q.done && q.started;
  const elapsed = useElapsed(done);
  useRecordDailyOnDone('quizzle', done, { score: q.bank, total: q.total, timeSeconds: elapsed });
  // One-per-day: a fresh entry (not yet started) after today's is done → recap.
  const recap = useDailyGuard('quizzle');
  if (q.quizzle && recap && !q.started) return <Redirect to={recap} />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/quizzle" />
          </IonButtons>
          <IonTitle>Quizzle</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState isLoading={q.isLoading} isError={q.isError} onRetry={q.refetch}>
          {!q.quizzle ? (
            <p className="sp-muted" data-testid="quizzle-unavailable">
              This quizzle can’t be played yet.
            </p>
          ) : (
            <div className="quizzle" data-testid="quizzle">
              <p className="quizzle__topic" data-testid="quizzle-topic">
                {q.topic}
              </p>
              <p className="quizzle__bank" data-testid="quizzle-bank">
                Bank: <strong>{q.bank}</strong>
              </p>
              {!q.started ? (
                <div className="quizzle__lobby">
                  <p className="quizzle__how">
                    Wager part of your bank on each of {q.total} questions. Answer right and your
                    stake is <strong>added</strong>; wrong and it&rsquo;s <strong>lost</strong>. Bet
                    big when you&rsquo;re sure.
                  </p>
                  {q.best != null && (
                    <p className="sp-muted" data-testid="quizzle-best">
                      Your best bank: {q.best}
                    </p>
                  )}
                  <button className="quizzle__btn" data-testid="quizzle-start" onClick={q.start}>
                    Start · bank {q.startingBank}
                  </button>
                </div>
              ) : q.done ? (
                <QuizzleDone bank={q.bank} startingBank={q.startingBank} best={q.best} />
              ) : q.question ? (
                <>
                  <p className="sp-muted quizzle__progress">
                    Question {q.index + 1} of {q.total}
                  </p>
                  <QuizzleRound
                    question={q.question}
                    stage={q.stage}
                    bank={q.bank}
                    wagerAmount={q.wagerAmount}
                    lastCorrect={q.lastCorrect}
                    lastAnswer={q.lastAnswer}
                    onWager={q.wager}
                    onAnswer={q.answer}
                    onAdvance={q.advance}
                  />
                </>
              ) : null}
            </div>
          )}
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
