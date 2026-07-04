import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Suspense } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { usePlay } from './usePlay';
import { useBestScore } from './useBestScore';
import { rendererFor, usesTypedInput } from './renderers';
import { modeHint } from './modeHint';
import { PlayHud } from './PlayHud';
import { PlayControls } from './PlayControls';
import { useRecordDailyOnDone } from '../../shared/daily/useRecordDailyOnDone';
import { useDailyGuard } from '../../shared/daily/useDailyGuard';
import { dailyKeyForMode } from './dailyKey';
import { LoadState } from '../../../features/shell/LoadState';
import './play.css';

/** Quiz play screen. Picks the renderer by quiz.mode, runs the shared engine
 * (timer + found set + score), shows the mode-shared HUD, and keys the daily
 * result per mode. Typed modes use PlayInput; others answer via `attempt`. */
export function Play() {
  const { id } = useParams<{ id: string }>();
  const p = usePlay(id);
  const { best } = useBestScore(id);
  const Renderer = rendererFor(p.quiz?.mode);
  const typed = usesTypedInput(p.quiz?.mode);
  const hint = p.status !== 'done' ? modeHint(p.quiz?.mode) : '';
  const dailyKey = dailyKeyForMode(p.quiz?.mode);
  useRecordDailyOnDone(dailyKey, p.status === 'done', {
    score: p.score.found,
    total: p.score.total,
    timeSeconds: p.timeSeconds,
  });
  // One-per-day: if today's puzzle of this type is already finished AND the
  // player isn't mid-session here, send them to the recap. `status==='idle'`
  // means a fresh entry (a just-finished session is 'done', so it stays put).
  const recap = useDailyGuard(dailyKey);
  if (p.quiz && recap && p.status === 'idle') return <Redirect to={recap} />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/quizzes" />
          </IonButtons>
          <IonTitle>{p.quiz?.topic ?? 'Quiz'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState isLoading={p.isLoading} isError={p.isError} onRetry={p.refetch}>
          {!p.quiz || !Renderer ? (
            <p className="sp-muted" data-testid="play-unavailable">
              This quiz can’t be played yet.
            </p>
          ) : (
            <div className="play">
              <PlayHud
                remaining={p.remaining}
                found={p.score.found}
                total={p.score.total}
                region={p.regionLabel}
              />
              {hint && (
                <p className="sp-muted play__hint" data-testid="play-hint">
                  {hint}
                </p>
              )}
              <Suspense fallback={<p className="sp-muted">Loading…</p>}>
                <Renderer
                  answers={p.answers}
                  found={p.found}
                  attempt={p.attempt}
                  status={p.status}
                />
              </Suspense>
              <PlayControls
                status={p.status}
                typed={typed}
                best={best}
                score={p.score}
                timeSeconds={p.timeSeconds}
                submit={p.submit}
                start={p.start}
                giveUp={p.giveUp}
              />
            </div>
          )}
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
