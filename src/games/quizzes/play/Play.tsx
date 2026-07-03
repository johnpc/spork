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
import { usePlay } from './usePlay';
import { useBestScore } from './useBestScore';
import { rendererFor, usesTypedInput } from './renderers';
import { PlayHud } from './PlayHud';
import { PlayControls } from './PlayControls';
import { useRecordDailyOnDone } from '../../shared/daily/useRecordDailyOnDone';
import { dailyKeyForMode } from './dailyKey';
import { LoadState } from '../../../features/shell/LoadState';
import './play.css';

/** Quiz play screen. Picks the renderer by quiz.mode, runs the shared engine
 * (timer + found set + score), and shows the mode-shared HUD. Typed-input modes
 * get the shared PlayInput; click/pick/arrange modes answer inside the renderer
 * via `attempt`. Each quiz TYPE is its own daily puzzle, so the daily result is
 * keyed + timed per mode. */
export function Play() {
  const { id } = useParams<{ id: string }>();
  const p = usePlay(id);
  const { best } = useBestScore(id);
  const Renderer = rendererFor(p.quiz?.mode);
  const typed = usesTypedInput(p.quiz?.mode);
  useRecordDailyOnDone(dailyKeyForMode(p.quiz?.mode), p.status === 'done', {
    score: p.score.found,
    total: p.score.total,
    timeSeconds: p.timeSeconds,
  });

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
              <PlayHud remaining={p.remaining} found={p.score.found} total={p.score.total} />
              <Renderer answers={p.answers} found={p.found} attempt={p.attempt} status={p.status} />
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
