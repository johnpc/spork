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
import { useLadder } from './useLadder';
import { StepInput } from './StepInput';
import { LadderPath } from './LadderPath';
import './steps.css';

const ERRORS: Record<string, string> = {
  length: 'Must be the same length.',
  'not-a-word': 'Not in the word list.',
  'not-one-letter': 'Change exactly one letter.',
  repeat: 'Already used that word.',
};

/** Steps (word ladder) play screen: transform start → target one letter at a
 * time. Uses its OWN engine (useLadder) — no shared quiz machinery. */
export function Steps() {
  const { id } = useParams<{ id: string }>();
  const l = useLadder(id);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/steps" />
          </IonButtons>
          <IonTitle>Steps</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {l.isLoading ? (
          <p className="sp-muted">Loading…</p>
        ) : !l.ladder ? (
          <p className="sp-muted" data-testid="steps-unavailable">
            This puzzle can’t be played yet.
          </p>
        ) : (
          <div className="steps" data-testid="steps">
            <p className="steps__goal" data-testid="steps-goal">
              <strong>{l.start.toUpperCase()}</strong> → <strong>{l.target.toUpperCase()}</strong>
            </p>
            <p className="sp-muted steps__meta">
              {l.moves} moves{l.par ? ` · par ${l.par}` : ''}
            </p>
            <LadderPath path={l.path} target={l.target} />
            {l.solved ? (
              <p className="steps__solved" data-testid="steps-solved">
                Solved in {l.moves} moves! {l.par && l.moves <= l.par ? '🏆 par or better' : ''}
              </p>
            ) : (
              <>
                <StepInput onSubmit={l.submit} />
                {l.lastError && (
                  <p className="steps__error" data-testid="steps-error">
                    {ERRORS[l.lastError] ?? 'Invalid move.'}
                  </p>
                )}
                <div className="steps__actions">
                  <button data-testid="steps-undo" onClick={l.undo} disabled={l.moves === 0}>
                    Undo
                  </button>
                  <button data-testid="steps-reset" onClick={l.reset} disabled={l.moves === 0}>
                    Reset
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
