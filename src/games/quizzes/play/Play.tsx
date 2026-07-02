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
import { rendererFor } from './renderers';
import { PlayHud } from './PlayHud';
import { PlayInput } from './PlayInput';
import { PlayDone } from './PlayDone';
import './play.css';

/** Quiz play screen. Picks the renderer by quiz.mode, runs the shared engine
 * (timer + found set + score), and shows the mode-shared HUD + input. */
export function Play() {
  const { id } = useParams<{ id: string }>();
  const p = usePlay(id);
  const { best, refresh } = useBestScore(id);
  const Renderer = rendererFor(p.quiz?.mode);

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
        {p.isLoading ? (
          <p className="sp-muted">Loading…</p>
        ) : !p.quiz || !Renderer ? (
          <p className="sp-muted" data-testid="play-unavailable">
            This quiz can’t be played yet.
          </p>
        ) : (
          <div className="play">
            <PlayHud remaining={p.remaining} found={p.score.found} total={p.score.total} />
            <Renderer answers={p.answers} found={p.found} />
            {p.status === 'idle' && (
              <div className="play__lobby">
                {best != null && (
                  <p className="sp-muted" data-testid="play-best">
                    Your best: {best} / {p.score.total}
                  </p>
                )}
                <button className="play__start" data-testid="play-start" onClick={p.start}>
                  Start
                </button>
              </div>
            )}
            {p.status === 'running' && (
              <>
                <PlayInput onSubmit={p.submit} />
                <button className="play__giveup" data-testid="play-giveup" onClick={p.giveUp}>
                  Give up
                </button>
              </>
            )}
            {p.status === 'done' && (
              <PlayDone
                found={p.score.found}
                total={p.score.total}
                onReplay={() => {
                  void refresh();
                  p.start();
                }}
              />
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
