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
import { usePlay } from './usePlay';
import { useBestScore } from './useBestScore';
import { rendererFor, usesTypedInput } from './renderers';
import { modeHint } from './modeHint';
import { PlayBoard } from './PlayBoard';
import { useRecordDailyOnDone } from '../../shared/daily/useRecordDailyOnDone';
import { useDailyGuard } from '../../shared/daily/useDailyGuard';
import { dailyKeyForMode } from './dailyKey';
import { LoadState } from '../../../features/shell/LoadState';
import './play.css';

/** Quiz play screen: picks the renderer by quiz.mode, runs the shared engine
 * (timer/found/score), shows the HUD, keys the daily result per mode. */
export function Play() {
  const { id } = useParams<{ id: string }>();
  const p = usePlay(id);
  const { best } = useBestScore(id);
  // effectiveMode is the mode Worldle plays TODAY (typed MAP vs. click CLICKABLE);
  // for every other quiz it's just the stored mode. The daily key stays on the
  // STORED mode so both faces of Worldle share one play-once-a-day record.
  const Renderer = rendererFor(p.effectiveMode);
  const typed = usesTypedInput(p.effectiveMode);
  const hint = p.status !== 'done' ? modeHint(p.effectiveMode) : '';
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
            <PlayBoard p={p} Renderer={Renderer} typed={typed} hint={hint} best={best} />
          )}
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
