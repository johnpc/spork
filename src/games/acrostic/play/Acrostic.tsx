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
import { useAcrostic } from './useAcrostic';
import { SecretWord } from './SecretWord';
import { AcrosticReveal } from './AcrosticReveal';
import { AcrosticClues } from './AcrosticClues';
import { useRecordDailyOnDone } from '../../shared/daily/useRecordDailyOnDone';
import { useElapsed } from '../../shared/daily/useElapsed';
import { useDailyGuard } from '../../shared/daily/useDailyGuard';
import { LoadState } from '../../../features/shell/LoadState';
import './acrostic.css';

/** Acrostic play screen: solve each clue; the answers' initials spell a hidden
 * word (SecretWord). Its own engine (useAcrostic) — no shared quiz machinery. */
export function Acrostic() {
  const { id } = useParams<{ id: string }>();
  const a = useAcrostic(id);
  const elapsed = useElapsed(a.complete);
  // Record + gate against the puzzle's OWN date (past-day sessions score that
  // day). Undefined → today.
  const day = a.acrostic?.puzzleDate ?? undefined;
  useRecordDailyOnDone(
    'acrostic',
    a.complete,
    { score: a.solvedCount, total: a.total, timeSeconds: elapsed },
    day,
  );
  // One-per-day: a fresh entry after that day's is done → recap.
  const recap = useDailyGuard('acrostic', day);
  if (a.acrostic && recap && !a.complete && a.solvedCount === 0) return <Redirect to={recap} />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/acrostic" />
          </IonButtons>
          <IonTitle>{a.acrostic?.title ?? 'Acrostic'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState isLoading={a.isLoading} isError={a.isError} onRetry={a.refetch}>
          {!a.acrostic ? (
            <p className="sp-muted" data-testid="acrostic-unavailable">
              This puzzle can’t be played yet.
            </p>
          ) : (
            <div className="acrostic" data-testid="acrostic">
              <p className="sp-muted acrostic__how">
                Solve each clue. The <strong>first letter</strong> of every answer spells the hidden
                word.
              </p>
              <SecretWord slots={a.slots} quote={a.quote} complete={a.complete} author={a.author} />
              <p
                className="sp-muted acrostic__meta"
                data-testid="acrostic-progress"
                aria-live="polite"
              >
                {a.solvedCount} / {a.total} solved
              </p>
              {a.complete || a.gaveUp ? (
                <AcrosticReveal
                  clues={a.clues}
                  solved={a.solved}
                  secret={a.secret}
                  quote={a.quote}
                  author={a.author}
                  complete={a.complete}
                />
              ) : (
                <AcrosticClues
                  clues={a.clues}
                  solved={a.solved}
                  lastWrong={a.lastWrong}
                  onGuess={a.guess}
                  onGiveUp={a.giveUp}
                />
              )}
            </div>
          )}
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
