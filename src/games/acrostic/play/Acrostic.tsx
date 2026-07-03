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
import { useAcrostic } from './useAcrostic';
import { ClueInput } from './ClueInput';
import { SecretWord } from './SecretWord';
import { useRecordDailyOnDone } from '../../shared/daily/useRecordDailyOnDone';
import { useElapsed } from '../../shared/daily/useElapsed';
import { LoadState } from '../../../features/shell/LoadState';
import './acrostic.css';

/** Acrostic play screen: solve each clue; the answers' initials spell a hidden
 * word (SecretWord). Its own engine (useAcrostic) — no shared quiz machinery. */
export function Acrostic() {
  const { id } = useParams<{ id: string }>();
  const a = useAcrostic(id);
  const elapsed = useElapsed(a.complete);
  useRecordDailyOnDone('acrostic', a.complete, {
    score: a.solvedCount,
    total: a.total,
    timeSeconds: elapsed,
  });

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
              <p className="sp-muted acrostic__meta" data-testid="acrostic-progress">
                {a.solvedCount} / {a.total} solved
              </p>
              {a.complete ? (
                <p className="acrostic__solved" data-testid="acrostic-solved">
                  Solved! 🏆 The word was <strong>{a.secret}</strong>.
                </p>
              ) : (
                <ol className="clue-list" data-testid="clue-list">
                  {a.clues.map((c, i) => (
                    <ClueInput
                      key={`${c.clue}-${i}`}
                      index={i}
                      clue={c.clue}
                      answer={c.answer}
                      solved={a.solved.has(i)}
                      wrong={a.lastWrong === i}
                      onGuess={a.guess}
                    />
                  ))}
                </ol>
              )}
            </div>
          )}
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
