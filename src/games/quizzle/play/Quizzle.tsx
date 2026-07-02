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
import { useQuizzle } from './useQuizzle';
import { QuizzleRound } from './QuizzleRound';
import { QuizzleDone } from './QuizzleDone';
import './quizzle.css';

/** Quizzle play screen: a pub-quiz where you WAGER against a bank each question.
 * Uses its OWN wager engine (useQuizzle) — no shared quiz machinery. */
export function Quizzle() {
  const { id } = useParams<{ id: string }>();
  const q = useQuizzle(id, window.localStorage);

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
        {q.isLoading ? (
          <p className="sp-muted">Loading…</p>
        ) : !q.quizzle ? (
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
              <button className="quizzle__btn" data-testid="quizzle-start" onClick={q.start}>
                Start · {q.total} questions · bank {q.startingBank}
              </button>
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
      </IonContent>
    </IonPage>
  );
}
